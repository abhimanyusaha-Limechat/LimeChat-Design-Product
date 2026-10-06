import { useEffect, useRef, useState } from 'react';
import { Button } from '../Button';
import { Icon } from '../icons';
import type { Spec } from './measure';
import { buildReport, fmt, specToCss, type ToolSet } from './report';

type CopyState = 'idle' | 'copied' | 'failed';

const COPY_FEEDBACK_MS = 2000;

interface SpecPanelProps {
  spec: Spec;
  tools: ToolSet;
  canSelectParent: boolean;
  onSelectParent: () => void;
  onUnpin: () => void;
}

/** The pinned element's values, grouped by tool, with off-scale ones called out. */
export function SpecPanel({ spec, tools, canSelectParent, onSelectParent, onUnpin }: SpecPanelProps) {
  const sections = buildReport(spec, tools);
  const [copy, setCopy] = useState<CopyState>('idle');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const showCopyState = (state: CopyState) => {
    setCopy(state);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopy('idle'), COPY_FEEDBACK_MS);
  };

  const onCopy = async () => {
    try {
      // Undefined outside secure contexts (e.g. the dev server on a LAN IP).
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(specToCss(spec, tools));
      showCopyState('copied');
    } catch {
      showCopyState('failed');
    }
  };

  return (
    <section className="lc-inspector__panel" aria-label="Element spec">
      <header className="lc-inspector__panel-head">
        <div className="lc-inspector__panel-title">
          <span className="lc-inspector__panel-name">{spec.anchor ?? spec.name}</span>
          <span className="lc-inspector__panel-size">
            {fmt(spec.rect.width / spec.scale)} × {fmt(spec.rect.height / spec.scale)}
            {spec.anchor && ` · ${spec.name}`}
          </span>
        </div>
        <button type="button" className="lc-inspector__tool" aria-label="Unpin element" onClick={onUnpin}>
          <Icon name="close" size={16} />
        </button>
      </header>

      {sections.length === 0 && <p className="lc-inspector__empty">Turn on a tool to see values.</p>}
      {sections.map((section) => (
        <div key={section.tool} className="lc-inspector__section">
          <h3 className="lc-inspector__section-title">{section.title}</h3>
          {section.empty ? (
            <p className="lc-inspector__empty">{section.empty}</p>
          ) : (
            <dl className="lc-inspector__rows">
              {section.rows.map((row) => (
                <div key={row.label} className="lc-inspector__row" data-off-scale={row.issue ? true : undefined}>
                  <dt>{row.label}</dt>
                  <dd>
                    <span className="lc-inspector__value">{row.value}</span>
                    {row.issue && (
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

      <footer className="lc-inspector__panel-foot">
        <Button
          variant="default"
          color="gray"
          size="xs"
          textTransform="none"
          leftSection={<Icon name="arrow-up" size={14} />}
          disabled={!canSelectParent}
          onClick={onSelectParent}
          title="Alt+↑"
        >
          Select parent
        </Button>
        <Button
          variant="default"
          color="gray"
          size="xs"
          textTransform="none"
          leftSection={<Icon name="copy" size={14} />}
          disabled={sections.length === 0}
          onClick={onCopy}
        >
          Copy CSS
        </Button>
        <span className="lc-inspector__copy-state" role="status">
          {copy === 'copied' ? 'Copied' : copy === 'failed' ? "Couldn't copy" : ''}
        </span>
      </footer>
    </section>
  );
}
