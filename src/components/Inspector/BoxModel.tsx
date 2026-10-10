import type { Spec } from './measure';
import { fmt } from './report';

const SIDES = ['top', 'right', 'bottom', 'left'] as const;

/** One layer of the diagram: its label, then a value on each side around whatever it wraps. */
function Layer({
  name,
  sides,
  children,
}: {
  name: string;
  sides: Spec['margin'];
  children: React.ReactNode;
}) {
  return (
    <div className={`lc-inspector__box lc-inspector__box--${name}`}>
      <span className="lc-inspector__box-name">{name}</span>
      {SIDES.map((side) => (
        <span key={side} className={`lc-inspector__box-side lc-inspector__box-side--${side}`}>
          {fmt(sides[side])}
        </span>
      ))}
      {children}
    </div>
  );
}

/** Margin → border → padding → content, like the browser DevTools box model. */
export function BoxModel({ spec }: { spec: Spec }) {
  const { margin, border, padding, rect, scale, scrollbar } = spec;
  const content = {
    width: Math.max(0, rect.width / scale - padding.left - padding.right - border.left - border.right - scrollbar.width),
    height: Math.max(0, rect.height / scale - padding.top - padding.bottom - border.top - border.bottom - scrollbar.height),
  };
  return (
    <div
      className="lc-inspector__boxmodel"
      role="img"
      aria-label={`Margin ${fmt(margin.top)} ${fmt(margin.right)} ${fmt(margin.bottom)} ${fmt(margin.left)}, padding ${fmt(padding.top)} ${fmt(padding.right)} ${fmt(padding.bottom)} ${fmt(padding.left)}, content ${fmt(content.width)} by ${fmt(content.height)}`}
    >
      <Layer name="margin" sides={margin}>
        <Layer name="border" sides={border}>
          <Layer name="padding" sides={padding}>
            <div className="lc-inspector__box-content">
              {fmt(content.width)} × {fmt(content.height)}
            </div>
          </Layer>
        </Layer>
      </Layer>
    </div>
  );
}
