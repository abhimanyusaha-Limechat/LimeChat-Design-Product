import { memo, useEffect, useRef, useState, type ComponentProps, type HTMLAttributes } from 'react';
import { Button } from '../Button';
import { Icon } from '../icons';
import type { IconName } from '../iconPaths';
import { BoxModel } from './BoxModel';
import type { Spec } from './measure';
import { editorHref, formatLoc, type Loc } from './reactSource';
import { RowEditor } from './RowEditor';
import { buildReport, editProps, fmt, specToCss, toMarkdown, type ToolSet } from './report';

type CopyState = 'idle' | 'copied' | 'failed';

const COPY_FEEDBACK_MS = 2000;

type FootButtonProps = Omit<ComponentProps<typeof Button>, 'leftSection'> & { icon: IconName };

/** The panel's small gray footer actions. */
function FootButton({ icon, ...props }: FootButtonProps) {
  return (
    <Button variant="default" color="gray" size="xs" textTransform="none" leftSection={<Icon name={icon} size={14} />} {...props} />
  );
}

/** A source row: plain text, or a link that opens the location in the editor. */
function SourceRow({ label, value, loc }: { label: string; value?: string; loc?: Loc }) {
  return (
    <div className="lc-inspector__row">
      <dt>{label}</dt>
      <dd>
        <span className="lc-inspector__value">
          {loc ? (
            <a className="lc-inspector__source-link" href={editorHref(loc)} title="Open in VS Code">
              {formatLoc(loc).split('/').map((part, i) => (
                <span key={i}>
                  {i > 0 && '/'}
                  <wbr />
                  {part}
                </span>
              ))}
            </a>
          ) : (
            value
          )}
        </span>
      </dd>
    </div>
  );
}

interface SpecPanelProps {
  spec: Spec;
  tools: ToolSet;
  canSelectParent: boolean;
  onSelectParent: () => void;
  onUnpin: () => void;
  /** Live-preview a style change on the pinned element. */
  onEdit: (prop: string, value: string) => void;
  onResetEdits: () => void;
  /** Pointer handlers that make the header move the panel. */
  dragProps: HTMLAttributes<HTMLElement>;
  dragging: boolean;
}

/**
 * The pinned element's values, grouped by tool, with off-scale ones called out.
 * Memoized: hovering other elements re-renders the Inspector, not this.
 */
export const SpecPanel = memo(function SpecPanel({ spec, tools, canSelectParent, onSelectParent, onUnpin, onEdit, onResetEdits, dragProps, dragging }: SpecPanelProps) {
  const sections = buildReport(spec, tools);
  const [copy, setCopy] = useState<CopyState>('idle');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const showCopyState = (state: CopyState) => {
    setCopy(state);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopy('idle'), COPY_FEEDBACK_MS);
  };

  const copyText = async (text: string) => {
    try {
      // Undefined outside secure contexts (e.g. the dev server on a LAN IP).
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      showCopyState('copied');
    } catch {
      showCopyState('failed');
    }
  };

  const issueCount = sections.reduce((n, sec) => n + sec.rows.filter((r) => r.issue).length, 0);
  const { source, edits } = spec;
  const edited = new Set(edits.map((e) => e.prop));

  return (
    <section className="lc-inspector__panel lc-scrollbar-thin" aria-label="Element spec">
      <header className="lc-inspector__panel-head" data-dragging={dragging || undefined} {...dragProps}>
        <div className="lc-inspector__panel-title">
          <span className="lc-inspector__panel-name">{spec.anchor ?? spec.name}</span>
          <span className="lc-inspector__panel-size">
            {fmt(spec.rect.width / spec.scale)} × {fmt(spec.rect.height / spec.scale)}
            {spec.anchor && ` · ${spec.name}`}
            {issueCount > 0 && (
              <span className="lc-inspector__issue-count">
                <Icon name="alert-triangle" size={12} />
                {issueCount} off-scale
              </span>
            )}
          </span>
        </div>
        <button
          type="button"
          className="lc-inspector__tool"
          aria-label="Unpin element"
          aria-keyshortcuts="Escape"
          onClick={onUnpin}
        >
          <Icon name="close" size={16} />
        </button>
      </header>

      <div className="lc-inspector__section">
        <h3 className="lc-inspector__section-title">Box model</h3>
        <BoxModel spec={spec} />
      </div>

      {sections.length === 0 && <p className="lc-inspector__empty">Turn on a tool to see values.</p>}
      {sections.map((section) => (
        <div key={section.tool} className="lc-inspector__section" data-empty={section.empty ? true : undefined}>
          <h3 className="lc-inspector__section-title">{section.title}</h3>
          {section.empty ? (
            <p className="lc-inspector__empty">{section.empty}</p>
          ) : (
            <dl className="lc-inspector__rows">
              {section.rows.map((row) => (
                <div
                  key={row.label}
                  className="lc-inspector__row"
                  data-off-scale={row.issue ? true : undefined}
                  data-edited={row.edit && editProps(row.edit).some((p) => edited.has(p)) ? true : undefined}
                >
                  <dt>{row.label}</dt>
                  <dd>
                    <span className="lc-inspector__value">
                      {row.swatch && (
                        <span className="lc-inspector__swatch" style={{ background: row.swatch }} aria-hidden="true" />
                      )}
                      {row.edit ? <RowEditor label={row.label} edit={row.edit} onEdit={onEdit} flagOffGrid={row.grid} /> : row.value}
                    </span>
                    {row.detail && <span className="lc-inspector__detail">{row.detail}</span>}
                    {row.issue && !row.grid && (
                      <span className="lc-inspector__issue">
                        <Icon name="alert-triangle" size={12} />
                        {row.issue}
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      ))}

      {source && (
        <div className="lc-inspector__section lc-inspector__section--source">
          <h3 className="lc-inspector__section-title">Source</h3>
          <dl className="lc-inspector__rows">
            {source.component && <SourceRow label="Component" value={source.component} />}
            {source.usedAt && <SourceRow label="Used at" loc={source.usedAt} />}
            {source.renderedAt && <SourceRow label="Rendered at" loc={source.renderedAt} />}
          </dl>
        </div>
      )}

      {edits.length > 0 && (
        <div className="lc-inspector__edits" role="status">
          <span>
            {edits.length} previewed {edits.length === 1 ? 'change' : 'changes'} · not saved
          </span>
          <button type="button" className="lc-inspector__link-button" onClick={onResetEdits}>
            Reset
          </button>
        </div>
      )}

      <footer className="lc-inspector__panel-foot">
        <FootButton
          icon="arrow-up"
          disabled={!canSelectParent}
          onClick={onSelectParent}
          title="↑"
          aria-keyshortcuts="ArrowUp"
        >
          Select parent
        </FootButton>
        <FootButton icon="copy" disabled={sections.length === 0} onClick={() => copyText(specToCss(spec, tools))}>
          Copy CSS
        </FootButton>
        <FootButton icon="copy" onClick={() => copyText(toMarkdown(spec, tools))}>
          Copy report
        </FootButton>
        <span className="lc-inspector__copy-state" role="status">
          {copy === 'copied' ? 'Copied' : copy === 'failed' ? "Couldn't copy" : ''}
        </span>
      </footer>
    </section>
  );
});
