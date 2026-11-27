/**
 * RichTextField — the V3 rich text editor as the Bot settings frames use it (Figma
 * "RichTextEditor v3": a bordered body, boxed toolbar groups, Improve pinned right).
 *
 * The prototype edits plain text. Merge fields are written as `{{customer.first_name}}`
 * and drawn as green tokens the caret skips over; the `{x}` tool inserts one. The other
 * formatting tools are for show.
 */
import { useId, useLayoutEffect, useRef, type FormEvent, type MouseEvent } from 'react';
import { Icon } from '../icons';
import { ICON_PATHS, type IconName } from '../iconPaths';
import './RichTextField.css';

/** `{{customer.first_name}}`, with the field name captured. */
export const TOKEN_PATTERN = /\{\{\s*([a-z0-9_.]+)\s*\}\}/gi;

interface Tool {
  icon: IconName;
  label: string;
  /** Opens a menu in the real editor, so it shows a caret. */
  menu?: boolean;
}

const TOOL_GROUPS: Tool[][] = [
  [
    { icon: 'bold', label: 'Bold' },
    { icon: 'italic', label: 'Italic' },
    { icon: 'underline', label: 'Underline' },
    { icon: 'strikethrough', label: 'Strikethrough' },
    { icon: 'clear-formatting', label: 'Clear formatting' },
  ],
  [
    { icon: 'heading', label: 'Heading', menu: true },
    { icon: 'list', label: 'List', menu: true },
    { icon: 'align-left', label: 'Align', menu: true },
  ],
  [
    { icon: 'link', label: 'Link' },
    { icon: 'variable', label: 'Insert variable' },
    { icon: 'mood-smile', label: 'Emoji' },
  ],
  [
    { icon: 'table', label: 'Table' },
    { icon: 'separator', label: 'Separator' },
    { icon: 'blockquote', label: 'Blockquote' },
    { icon: 'source-code', label: 'Source code' },
  ],
];

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');

const VARIABLE_SVG =
  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  ICON_PATHS.variable.map((d) => `<path d="${d}"></path>`).join('') +
  '</svg>';

const tokenHtml = (name: string) =>
  `<span class="lc-rte__token" contenteditable="false" data-token="${name}">${VARIABLE_SVG}${name}</span>`;

/** The editor body for a value: text with each merge field drawn as a token. */
export function toHtml(value: string): string {
  let html = '';
  let last = 0;
  for (const match of value.matchAll(TOKEN_PATTERN)) {
    html += escapeHtml(value.slice(last, match.index)) + tokenHtml(match[1]);
    last = match.index + match[0].length;
  }
  return html + escapeHtml(value.slice(last));
}

function readNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
  if (!(node instanceof HTMLElement)) return '';
  if (node.dataset.token) return `{{${node.dataset.token}}}`;
  if (node.tagName === 'BR') return '\n';
  const inner = Array.from(node.childNodes).map(readNode).join('');
  return node.tagName === 'DIV' || node.tagName === 'P' ? `\n${inner}` : inner;
}

/** The value back out of the editor body, tokens as `{{name}}`. */
export function fromDom(body: HTMLElement): string {
  return Array.from(body.childNodes)
    .map(readNode)
    .join('')
    .replace(/ /g, ' ')
    .replace(/^\n/, '');
}

/** The Improve wand, stroked in the AI gradient. */
function WandIcon() {
  const gradientId = `lc-rte-wand-${useId().replace(/:/g, '')}`;
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke={`url(#${gradientId})`}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#76be2e" />
          <stop offset="1" stopColor="#298b94" />
        </linearGradient>
      </defs>
      {ICON_PATHS.wand.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export interface RichTextFieldProps {
  value: string;
  onChange: (next: string) => void;
  /** Names the editor for assistive tech. The visible label is the row's. */
  label: string;
  /** Shown while the value is empty. */
  placeholder?: string;
  disabled?: boolean;
  /** Handles the Improve button, in place of the demo's alert. */
  onImprove?: () => void;
}

// mousedown would move focus (and the caret) out of the body.
const keepFocus = (e: MouseEvent) => e.preventDefault();

export function RichTextField({
  value,
  onChange,
  label,
  placeholder = 'Nothing set. The built-in default is used.',
  disabled,
  onImprove,
}: RichTextFieldProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  // What the body last showed or emitted. A value from outside (reset, undo) redraws the
  // body; the user's own typing does not, so the caret stays put.
  const shown = useRef<string | null>(null);

  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body || value === shown.current) return;
    body.innerHTML = toHtml(value);
    shown.current = value;
  }, [value]);

  const handleInput = (e: FormEvent<HTMLDivElement>) => {
    const next = fromDom(e.currentTarget);
    shown.current = next;
    onChange(next);
  };

  const insertToken = () => {
    const before = value.replace(/\s+$/, '');
    onChange(`${before}${before ? ' ' : ''}{{customer.first_name}} `);
  };

  return (
    <div className="lc-rte" data-disabled={disabled || undefined} data-empty={value === '' || undefined}>
      <div
        ref={bodyRef}
        className="lc-rte__body"
        role="textbox"
        aria-multiline="true"
        aria-label={label}
        aria-disabled={disabled || undefined}
        data-placeholder={placeholder}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={handleInput}
      />
      <div className="lc-rte__toolbar" role="toolbar" aria-label={`${label} formatting`}>
        {TOOL_GROUPS.map((group, i) => (
          <div key={i} className="lc-rte__group">
            {group.map((tool) => (
              <button
                key={tool.icon}
                type="button"
                className="lc-rte__tool"
                aria-label={tool.label}
                title={tool.label}
                disabled={disabled}
                onMouseDown={keepFocus}
                onClick={tool.icon === 'variable' ? insertToken : undefined}
              >
                <Icon name={tool.icon} size={16} />
                {tool.menu && <Icon name="chevron-down" size={16} className="lc-rte__caret" />}
              </button>
            ))}
          </div>
        ))}
        <span className="lc-rte__spacer" aria-hidden="true" />
        <div className="lc-rte__improve">
          <button
            type="button"
            className="lc-rte__improve-main"
            disabled={disabled}
            onClick={onImprove ?? (() => alert(`Improve with AI: ${label}`))}
          >
            <WandIcon />
            <span>Improve</span>
          </button>
          <span className="lc-rte__improve-divider" aria-hidden="true" />
          <button
            type="button"
            className="lc-rte__improve-caret"
            aria-label="Improve options"
            disabled={disabled}
            onClick={() => alert('Improve options: Shorter, Warmer, Professional')}
          >
            <Icon name="chevron-down" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default RichTextField;
