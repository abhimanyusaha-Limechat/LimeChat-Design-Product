/**
 * PublishHistoryPanel — Figma node 4630:28023 ("Version History Side panel").
 *
 * Used for the agent's publish history and for the knowledge base's change log. The row's
 * controls follow the callbacks it is given: no `onSelect` and the rows are a read-only log,
 * no `onDownload` and the download button is gone.
 *
 * Floats over the right of the page, in two parts:
 *
 *   • the Current card — the agent as it stands right now. It has never been published, so it
 *     carries no timestamp and no version number; what it does carry is who has it open, and a
 *     download of the snapshot as it is.
 *   • the published history below it — a timeline of actual publishes, newest first. Hovering
 *     or focusing a row reveals View, and every row can be downloaded.
 *
 * Restoring is deliberately not here: it lives on the banner that appears once a version is on
 * screen, so browsing the history can never change the agent by accident.
 *
 *   <PublishHistoryPanel current={{ editor: 'Arjun Mehta' }} versions={PUBLISH_HISTORY} … />
 */
import { useEffect, useRef } from 'react';
import { Avatar } from '../Avatar';
import { Tooltip } from '../Tooltip';
import { Icon } from '../icons';
import './PublishHistoryPanel.css';

/** "Arjun Mehta" → "AM"; a single name gives one letter. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? '') + (parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '');
}

/** The thing as it stands: unpublished, and someone has it open. */
export interface CurrentVersion {
  editor: string;
}

/** One line of history. `PublishedVersion` is the agent's richer version of this. */
export interface HistoryEntry {
  id: string;
  /** Already formatted, as the design shows it: "2:45 pm, 3rd Aug 26". */
  publishedAt: string;
  author: string;
  /** A version name, set against the date. Absent for histories that are not publishes. */
  version?: string;
  /** What the author did, read after their name: "added Return policy.pdf". */
  detail?: string;
}

export interface PublishHistoryPanelProps<T extends HistoryEntry> {
  /** Omitted, the panel is the history alone. */
  current?: CurrentVersion;
  versions: readonly T[];
  onClose: () => void;
  /** The panel's heading, and its accessible name. */
  title?: string;
  /** The tooltip beside the heading. */
  hint?: string;
  /** The label over the list, above its count. */
  sectionLabel?: string;
  /** Given, the rows become buttons that show that entry. Omitted, the list is read-only. */
  onSelect?: (version: T) => void;
  /** The entry currently on screen, highlighted in the list. */
  selectedId?: string;
  /** Given, each row offers a download. */
  onDownload?: (version: T) => void;
  /** Given, the Current card offers a download of the snapshot as it stands. */
  onDownloadCurrent?: () => void;
}

export function PublishHistoryPanel<T extends HistoryEntry>({
  current,
  versions,
  onClose,
  title = 'Publish History',
  hint = 'The agent as it stands, and every publish before it.',
  sectionLabel = 'Published',
  onSelect,
  selectedId,
  onDownload,
  onDownloadCurrent,
}: PublishHistoryPanelProps<T>) {
  const panel = useRef<HTMLDivElement>(null);

  // Escape closes it, wherever focus is.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    panel.current?.focus();
  }, []);

  return (
    <div className="lc-phist" ref={panel} tabIndex={-1} role="dialog" aria-label={title} data-anchor="publish-history">
      <div className="lc-phist__header">
        <h2 className="lc-phist__title">{title}</h2>
        <Tooltip label={hint}>
          <span className="lc-phist__info" aria-hidden="true">
            <Icon name="info-circle" size={16} />
          </span>
        </Tooltip>
        <button type="button" className="lc-phist__close" aria-label={`Close ${title.toLowerCase()}`} onClick={onClose}>
          <Icon name="close" size={12} />
        </button>
      </div>

      {current && (
        <section className="lc-phist__current" aria-label="Current version">
          <div className="lc-phist__current-top">
            <span className="lc-phist__status">
              <span className="lc-phist__dot" aria-hidden="true" />
              Current
            </span>
            {onDownloadCurrent && (
              <button
                type="button"
                className="lc-phist__icon-btn"
                aria-label="Download the current snapshot"
                onClick={onDownloadCurrent}
              >
                <Icon name="download-tray" size={16} />
              </button>
            )}
          </div>
          <div className="lc-phist__author">
            <Avatar size={24} radius="xl" className="lc-phist__avatar">
              {initials(current.editor)}
            </Avatar>
            <span className="lc-phist__name">{current.editor} is editing</span>
          </div>
        </section>
      )}

      <p className="lc-phist__section">
        {sectionLabel}
        <span className="lc-phist__count">{versions.length}</span>
      </p>

      {/* A read-only log gets no hover lift: nothing happens when you click it. */}
      <ul className="lc-phist__list" data-interactive={onSelect ? '' : undefined}>
        {versions.map((version) => {
          const selected = version.id === selectedId;
          return (
            // The node and the connecting line are drawn on the item, so the list reads as a
            // timeline rather than nine look-alike cards.
            <li key={version.id} className="lc-phist__item" data-selected={selected || undefined}>
              <div className="lc-phist__row">
                {/* Sits behind the row and fills it, so the whole row selects the version without
                    nesting the Download button inside another button. */}
                {onSelect && (
                  <button
                    type="button"
                    className="lc-phist__select"
                    aria-label={`View the version published ${version.publishedAt} by ${version.author}`}
                    aria-pressed={selected}
                    onClick={() => onSelect(version)}
                  />
                )}
                <div className="lc-phist__when">
                  <span className="lc-phist__date">{version.publishedAt}</span>
                  {version.version && <span className="lc-phist__version">{version.version}</span>}
                </div>
                <div className="lc-phist__author">
                  <Avatar size={24} radius="xl" className="lc-phist__avatar">
                    {initials(version.author)}
                  </Avatar>
                  <span className="lc-phist__name">
                    {version.author}
                    {version.detail && <span className="lc-phist__detail"> {version.detail}</span>}
                  </span>
                  <span className="lc-phist__actions">
                    {/* A quiet cue, not a second control: the row itself is the View button, so
                        this is `aria-hidden` and lets clicks fall through to it. */}
                    {onSelect && (
                      <span className="lc-phist__view" aria-hidden="true">
                        View
                      </span>
                    )}
                    {onDownload && (
                      <button
                        type="button"
                        className="lc-phist__icon-btn"
                        aria-label={`Download version from ${version.publishedAt}`}
                        onClick={() => onDownload(version)}
                      >
                        <Icon name="download-tray" size={16} />
                      </button>
                    )}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default PublishHistoryPanel;
