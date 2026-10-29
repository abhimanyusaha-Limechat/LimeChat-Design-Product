import { useState, type HTMLAttributes } from 'react';
import { initials } from '../components/AccountPicker/AccountPicker';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Icon } from '../components/icons';
import type { Comment } from './api';
import type { Point } from './placement';
import { timeAgo } from '../components/timeAgo';
import type { CommentsStatus } from './useComments';

function Byline({ name, at, build }: { name: string; at: string; build?: string }) {
  return (
    <div className="lc-comments__byline">
      <Avatar size={20} radius="xl" variant="filled">
        {initials(name)}
      </Avatar>
      <span className="lc-comments__author">{name}</span>
      <time dateTime={at} title={new Date(at).toLocaleString()}>
        {timeAgo(at)}
      </time>
      {build && (
        <span className="lc-comments__build" title="Build this was made on">
          {build}
        </span>
      )}
    </div>
  );
}

interface ThreadProps {
  comment: Comment;
  number: number;
  isDesigner: boolean;
  onReply: (id: string, body: string) => Promise<void>;
  onResolve: (id: string) => Promise<void>;
}

function Thread({ comment, number, isDesigner, onReply, onResolve }: ThreadProps) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState<'reply' | 'resolve' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (kind: 'reply' | 'resolve', action: () => Promise<void>, failure: string) => {
    setBusy(kind);
    setError(null);
    try {
      await action();
      if (kind === 'reply') setText('');
    } catch {
      setError(failure);
    } finally {
      setBusy(null);
    }
  };

  const sendReply = () => text.trim() && run('reply', () => onReply(comment.id, text.trim()), "Couldn't post the reply.");

  return (
    <div className="lc-comments__thread">
      <article className="lc-comments__message" aria-label={`Comment ${number}`}>
        <Byline name={comment.author_name} at={comment.created_at} build={comment.build_sha} />
        <p className="lc-comments__body">{comment.body}</p>
        {comment.anchor === null && !comment.in_overlay && (
          <p className="lc-comments__hint">
            Placed at {comment.viewport_w}×{comment.viewport_h}, not attached to an element.
          </p>
        )}
        {comment.in_overlay && <p className="lc-comments__hint">Made on a menu or dialog.</p>}
      </article>
      {comment.replies.map((r) => (
        <article key={r.id} className="lc-comments__message" data-reply="">
          <Byline name={r.author_name} at={r.created_at} />
          <p className="lc-comments__body">{r.body}</p>
        </article>
      ))}
      <div className="lc-comments__reply">
        <textarea
          className="lc-comments__input"
          aria-label="Reply"
          placeholder="Reply"
          rows={2}
          maxLength={5000}
          value={text}
          disabled={busy !== null}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              sendReply();
            }
          }}
        />
        {error && (
          <p className="lc-comments__error" role="alert">
            {error}
          </p>
        )}
        <div className="lc-comments__actions">
          {isDesigner && (
            <Button
              variant="default"
              color="gray"
              size="xs"
              textTransform="none"
              leftSection={<Icon name="circle-check" size={14} />}
              loading={busy === 'resolve'}
              disabled={busy !== null}
              onClick={() => run('resolve', () => onResolve(comment.id), "Couldn't resolve.")}
            >
              Resolve
            </Button>
          )}
          <Button size="xs" textTransform="none" disabled={!text.trim() || busy !== null} loading={busy === 'reply'} onClick={sendReply}>
            Reply
          </Button>
        </div>
      </div>
    </div>
  );
}

interface CommentsPanelProps {
  status: CommentsStatus;
  comments: Comment[];
  /** Where each Comment's Pin is drawn; null = not visible on this view. */
  pinned: Record<string, Point | null>;
  isDesigner: boolean;
  threadId: string | null;
  announcement: string;
  dragProps: HTMLAttributes<HTMLElement>;
  dragging: boolean;
  onOpenThread: (id: string) => void;
  onCloseThread: () => void;
  onRetry: () => void;
  onReply: (id: string, body: string) => Promise<void>;
  onResolve: (id: string) => Promise<void>;
  onExit: () => void;
}

/** The current Screen's Comments, or one thread. Lives in the Inspector's panel slot. */
export function CommentsPanel({
  status,
  comments,
  pinned,
  isDesigner,
  threadId,
  announcement,
  dragProps,
  dragging,
  onOpenThread,
  onCloseThread,
  onRetry,
  onReply,
  onResolve,
  onExit,
}: CommentsPanelProps) {
  const index = threadId ? comments.findIndex((c) => c.id === threadId) : -1;
  const thread = index >= 0 ? comments[index] : null;
  // Open thread gone after a refetch: someone resolved it meanwhile.
  const vanished = threadId !== null && thread === null && status === 'ready';

  return (
    <section className="lc-inspector__panel lc-scrollbar-thin lc-comments__panel" aria-label="Comments">
      <header className="lc-inspector__panel-head" data-dragging={dragging || undefined} {...dragProps}>
        {thread ? (
          <button type="button" className="lc-inspector__tool" aria-label="Back to all comments" onClick={onCloseThread}>
            <Icon name="chevron-left" size={16} />
          </button>
        ) : null}
        <div className="lc-inspector__panel-title">
          <span className="lc-inspector__panel-name">{thread ? `Comment ${index + 1}` : 'Comments'}</span>
          <span className="lc-inspector__panel-size">
            {thread ? `${thread.replies.length} ${thread.replies.length === 1 ? 'reply' : 'replies'}` : 'Click anywhere to comment'}
          </span>
        </div>
        <button type="button" className="lc-inspector__tool" aria-label="Close comments" onClick={onExit}>
          <Icon name="close" size={16} />
        </button>
      </header>

      {thread ? (
        <Thread key={thread.id} comment={thread} number={index + 1} isDesigner={isDesigner} onReply={onReply} onResolve={onResolve} />
      ) : (
        <div className="lc-inspector__section">
          {vanished && <p className="lc-comments__hint">That comment was resolved.</p>}
          {status === 'loading' && <p className="lc-inspector__empty">Loading comments…</p>}
          {status === 'signed-out' && <p className="lc-inspector__empty">You're signed out. Reload the page to sign in again.</p>}
          {status === 'error' && (
            <div className="lc-comments__state">
              <p className="lc-inspector__empty">Couldn't load comments.</p>
              <Button variant="default" color="gray" size="xs" textTransform="none" onClick={onRetry}>
                Retry
              </Button>
            </div>
          )}
          {status === 'ready' && comments.length === 0 && <p className="lc-inspector__empty">No comments on this screen.</p>}
          {status === 'ready' && comments.length > 0 && (
            <ol className="lc-comments__list">
              {comments.map((c, i) => (
                <li key={c.id}>
                  <button type="button" className="lc-comments__item" onClick={() => onOpenThread(c.id)}>
                    <span className="lc-comments__number" aria-hidden="true">
                      {i + 1}
                    </span>
                    <span className="lc-comments__item-text">
                      <span className="lc-comments__item-meta">
                        {c.author_name} · {timeAgo(c.created_at)}
                        {c.replies.length > 0 && ` · ${c.replies.length} ${c.replies.length === 1 ? 'reply' : 'replies'}`}
                      </span>
                      <span className="lc-comments__item-body">{c.body}</span>
                      {!pinned[c.id] && <span className="lc-comments__item-meta">Not visible on this view</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      <div className="lc-inspector__announce" role="status">
        {announcement}
      </div>
    </section>
  );
}
