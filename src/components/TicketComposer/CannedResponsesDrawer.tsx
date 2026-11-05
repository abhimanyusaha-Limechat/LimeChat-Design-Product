/**
 * Canned responses drawer — the list that floats above the composer (Figma AI Helpdesk 1570:27099).
 * Presentational: the composer owns the open state, the filter and the keyboard handling, and
 * keeps focus in the textarea, so rows are options of that textarea's listbox rather than tab stops.
 */
import { useEffect, useRef } from 'react';
import { Icon } from '../icons';
import './CannedResponsesDrawer.css';

export interface CannedResponseOption {
  name: string;
  /** Serial number shown before the name, e.g. a template's. */
  code?: string;
  /** What the preview shows, and what a text response puts in the box. */
  message: string;
  /** File name of an image response; picking it attaches the image instead of filling the box. */
  attachment?: string;
}

interface CannedResponsesDrawerProps {
  /** Listbox id; the rows are `${id}-${index}`, for the textarea's aria-activedescendant. */
  id: string;
  /** The listbox's accessible name. */
  label: string;
  options: CannedResponseOption[];
  /** Lower-cased search text; its first match in each name is highlighted. */
  query: string;
  activeIndex: number;
  onActiveChange: (index: number) => void;
  onPick: (option: CannedResponseOption) => void;
}

/** The name with the first occurrence of the search text wrapped in <mark>. */
function Highlighted({ text, query }: { text: string; query: string }) {
  const at = query ? text.toLowerCase().indexOf(query) : -1;
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <mark className="lc-canned-drawer__match">{text.slice(at, at + query.length)}</mark>
      {text.slice(at + query.length)}
    </>
  );
}

export function CannedResponsesDrawer({ id, label, options, query, activeIndex, onActiveChange, onPick }: CannedResponsesDrawerProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Keep the arrow-key selection in view once the list scrolls.
  useEffect(() => {
    listRef.current?.children[activeIndex]?.scrollIntoView?.({ block: 'nearest' });
  }, [activeIndex]);

  return (
    <div className="lc-canned-drawer">
      <div ref={listRef} className="lc-canned-drawer__list" id={id} role="listbox" aria-label={label}>
        {options.length === 0 ? (
          <div className="lc-canned-drawer__empty">Nothing found</div>
        ) : (
          options.map((option, index) => (
            <div
              key={option.name}
              id={`${id}-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className="lc-canned-drawer__row"
              data-active={index === activeIndex || undefined}
              // mousedown would blur the textarea, closing the drawer before the click lands.
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => onActiveChange(index)}
              onClick={() => onPick(option)}
            >
              <Icon name={option.attachment ? 'photo' : 'typography'} size={16} />
              <span className="lc-canned-drawer__name">
                {option.code && <span className="lc-canned-drawer__code">{option.code}</span>}
                <Highlighted text={option.name} query={query} />
              </span>
              <span className="lc-canned-drawer__message">{option.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
