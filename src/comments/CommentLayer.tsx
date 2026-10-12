/**
 * The Comment tool: mounted by the Inspector while it's on. Swallows app
 * presses (like Inspect mode), turns a click into a draft Pin and composer,
 * draws the current Screen's Pins, and renders the Comments panel in the
 * Inspector's panel slot.
 */
import {
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type MutableRefObject,
  type SyntheticEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { isIgnoredUi, usePageCapture } from '../hooks/usePageCapture';
import { SignedOutError, type Comment } from './api';
import { CommentComposer } from './CommentComposer';
import { CommentsPanel } from './CommentsPanel';
import { anchorFor, pinPoint, placeAt, type Placement, type Point } from './placement';
import { useComments } from './useComments';
import './Comments.css';

/** What the Inspector's key handler asks of the layer, ahead of its own steps. */
export interface CommentKeys {
  /** Closes the innermost comment UI; false when there was nothing to close. */
  escape: () => boolean;
  /** Starts a Comment on the focused element; false when nothing in the app is focused. */
  commentOnFocused: () => boolean;
}

interface Spot {
  placement: Placement;
  /** Where the click was: the fallback when the placement can't be pinned (an overlay). */
  at: Point;
}

type Rect = Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>;

interface Layout {
  pins: Record<string, Point | null>;
  draft: Point | null;
  outline: Rect | null;
}

const keepFromApp = (e: SyntheticEvent) => e.stopPropagation();

/**
 * Pin, draft and hover-outline positions, re-read every frame while the tool is on.
 * ponytail: a continuous rAF loop catches every scroll, resize and re-render for
 * free; switch to event-driven scheduling if many hundreds of Pins ever make it costly.
 */
function useLiveLayout(comments: Comment[], spot: Spot | null, hovered: MutableRefObject<Element | null>): Layout {
  const [layout, setLayout] = useState<Layout>({ pins: {}, draft: null, outline: null });
  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const pins: Record<string, Point | null> = {};
      for (const c of comments) pins[c.id] = pinPoint(c);
      const anchor = hovered.current?.isConnected ? anchorFor(hovered.current) : null;
      const r = anchor?.getBoundingClientRect();
      const next: Layout = {
        pins,
        draft: spot ? (pinPoint(spot.placement) ?? spot.at) : null,
        outline: r ? { left: r.left, top: r.top, width: r.width, height: r.height } : null,
      };
      setLayout((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
      frame = window.requestAnimationFrame(tick);
    };
    tick();
    return () => window.cancelAnimationFrame(frame);
  }, [comments, spot, hovered]);
  return layout;
}

interface CommentLayerProps {
  keysRef: MutableRefObject<CommentKeys | null>;
  /** Leaves the Comment tool (the panel's close button). */
  onExit: () => void;
  dragProps: HTMLAttributes<HTMLElement>;
  dragging: boolean;
}

export function CommentLayer({ keysRef, onExit, dragProps, dragging }: CommentLayerProps) {
  const { status, comments, isDesigner, retry, add, reply, resolve } = useComments();
  const [spot, setSpot] = useState<Spot | null>(null);
  const [text, setText] = useState('');
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const hovered = useRef<Element | null>(null);
  /** Where focus was before the composer took it, to give it back. */
  const returnFocus = useRef<Element | null>(null);
  const layout = useLiveLayout(comments, spot, hovered);
  const hasText = text.trim() !== '';

  const closeDraft = () => {
    setSpot(null);
    setText('');
    setConfirmDiscard(false);
    setPostError(null);
    const back = returnFocus.current;
    if (back instanceof HTMLElement && back.isConnected) back.focus();
  };

  /** A click or Alt+Enter: start a draft there — unless one has text, which a stray click mustn't lose. */
  const startDraft = (target: Element, x: number, y: number) => {
    if (hasText) {
      composerRef.current?.focus();
      return;
    }
    if (!spot) returnFocus.current = document.activeElement;
    setSpot({ placement: placeAt(target, x, y), at: { left: x, top: y } });
    setConfirmDiscard(false);
    setPostError(null);
  };

  usePageCapture(true, {
    onPress: startDraft,
    onHover: (target) => {
      hovered.current = target;
    },
  });

  // Crosshair everywhere but our own UI, while the tool is on.
  useEffect(() => {
    document.documentElement.setAttribute('data-lc-commenting', '');
    return () => document.documentElement.removeAttribute('data-lc-commenting');
  }, []);

  useEffect(() => {
    keysRef.current = {
      escape() {
        if (spot) {
          if (hasText && !confirmDiscard) setConfirmDiscard(true);
          else closeDraft();
          return true;
        }
        if (threadId) {
          setThreadId(null);
          return true;
        }
        return false;
      },
      commentOnFocused() {
        const el = document.activeElement;
        if (!el || el === document.body || isIgnoredUi(el)) return false;
        const r = el.getBoundingClientRect();
        startDraft(el, r.left + r.width / 2, r.top + r.height / 2);
        return true;
      },
    };
    return () => {
      keysRef.current = null;
    };
  });

  const post = async () => {
    if (!spot || !hasText || posting) return;
    setPosting(true);
    setPostError(null);
    try {
      await add({ ...spot.placement, body: text.trim() });
      closeDraft();
      setAnnouncement('Comment posted');
    } catch (err) {
      setPostError(err instanceof SignedOutError ? "You're signed out. Reload to sign in." : "Couldn't post. Try again.");
    } finally {
      setPosting(false);
    }
  };

  const onReply = async (id: string, body: string) => {
    await reply(id, body);
    setAnnouncement('Reply posted');
  };

  const onResolve = async (id: string) => {
    await resolve(id);
    setThreadId(null);
    setAnnouncement('Comment resolved');
  };

  return (
    <>
      <CommentsPanel
        status={status}
        comments={comments}
        pinned={layout.pins}
        isDesigner={isDesigner}
        threadId={threadId}
        announcement={announcement}
        dragProps={dragProps}
        dragging={dragging}
        onOpenThread={setThreadId}
        onCloseThread={() => setThreadId(null)}
        onRetry={retry}
        onReply={onReply}
        onResolve={onResolve}
        onExit={onExit}
      />
      {createPortal(
        <div
          className="lc-comments"
          data-inspector-ui=""
          onPointerDown={keepFromApp}
          onMouseDown={keepFromApp}
          onClick={keepFromApp}
        >
          {layout.outline && (
            <div className="lc-comments__outline" style={layout.outline} aria-hidden="true" />
          )}
          {comments.map((c, i) => {
            const p = layout.pins[c.id];
            if (!p) return null;
            return (
              <button
                key={c.id}
                type="button"
                className="lc-comments__pin"
                style={{ left: p.left, top: p.top }}
                data-open={threadId === c.id || undefined}
                aria-label={`Comment ${i + 1} by ${c.author_name}: ${c.body.slice(0, 40)}`}
                onClick={() => setThreadId(c.id)}
              >
                {i + 1}
              </button>
            );
          })}
          {spot && layout.draft && (
            <>
              <span className="lc-comments__pin" data-draft="" style={{ left: layout.draft.left, top: layout.draft.top }} aria-hidden="true" />
              <CommentComposer
                ref={composerRef}
                at={layout.draft}
                text={text}
                posting={posting}
                error={postError}
                confirmDiscard={confirmDiscard}
                inOverlay={spot.placement.in_overlay}
                onChange={(next) => {
                  setText(next);
                  setConfirmDiscard(false);
                }}
                onPost={post}
                onCancel={closeDraft}
              />
            </>
          )}
        </div>,
        document.body,
      )}
    </>
  );
}
