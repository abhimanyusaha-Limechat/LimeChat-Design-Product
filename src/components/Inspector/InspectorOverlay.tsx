import type { CSSProperties } from 'react';
import { isAllowedFontSize, isOnSpacingGrid } from './designScale';
import { intersect, stripValue, type Rect, type Spec } from './measure';
import { buildLabel, buildReport, fmt, hasIssues, type ToolSet } from './report';

/** Chips need this much run along a band or strip (rendered px), or they'd collide at corners. */
const MIN_CHIP_RUN = 20;
const LABEL_MAX_WIDTH = 280;

const box = ({ left, top, width, height }: Rect): CSSProperties => ({ left, top, width, height });

/** One highlighted area. `value` (CSS px) gets a chip; text lines have none — the label carries type. */
interface Mark {
  kind: 'padding' | 'gap' | 'text';
  rect: Rect;
  offScale: boolean;
  value?: number;
}

const spacingMark = (kind: 'padding' | 'gap', rect: Rect, value: number): Mark => ({
  kind,
  rect,
  value,
  offScale: !isOnSpacingGrid(value),
});

/** Padding bands, inside the border and any scrollbar, at the element's rendered scale. */
function paddingMarks({ rect, padding: p, border: b, scrollbar: sb, scale: s }: Spec): Mark[] {
  const inner = {
    left: rect.left + b.left * s,
    top: rect.top + b.top * s,
    width: rect.width - (b.left + b.right + sb.width) * s,
    height: rect.height - (b.top + b.bottom + sb.height) * s,
  };
  const middleTop = inner.top + p.top * s;
  const middleHeight = inner.height - (p.top + p.bottom) * s;
  return [
    spacingMark('padding', { ...inner, height: p.top * s }, p.top),
    spacingMark('padding', { ...inner, top: inner.top + inner.height - p.bottom * s, height: p.bottom * s }, p.bottom),
    spacingMark('padding', { left: inner.left, top: middleTop, width: p.left * s, height: middleHeight }, p.left),
    spacingMark(
      'padding',
      { left: inner.left + inner.width - p.right * s, top: middleTop, width: p.right * s, height: middleHeight },
      p.right,
    ),
  ];
}

function marksFor(spec: Spec, tools: ToolSet): Mark[] {
  const marks: Mark[] = [];
  if (tools.type && spec.type) {
    const offScale = !isAllowedFontSize(spec.type.size);
    marks.push(...spec.textLines.map((rect) => ({ kind: 'text' as const, rect, offScale })));
  }
  if (tools.padding && spec.drawBands) marks.push(...paddingMarks(spec));
  const { gap } = spec;
  if (tools.gap && gap) {
    marks.push(
      ...spec.gapStrips.map(({ rect, axis, size }) =>
        spacingMark('gap', rect, stripValue(size, axis === 'column' ? gap.column : gap.row, spec.scale)),
      ),
    );
  }
  return marks.filter((m) => m.rect.width > 0 && m.rect.height > 0);
}

/** Rough rendered chip size: 10px bold digits plus padding and ring. */
const CHIP_HEIGHT = 16;
const chipWidth = (text: string) => text.length * 6 + 10;

interface ChipProps {
  kind: Mark['kind'];
  offScale: boolean;
  text: string;
  rect: Rect;
}

/**
 * Value chips centered on their marks. Skips marks too short to hold one, and
 * any chip that would land on one already placed (adjacent strips, tiny boxes).
 */
function placeChips(marks: Mark[]): ChipProps[] {
  const placed: ChipProps[] = [];
  for (const { kind, offScale, value, rect } of marks) {
    if (value === undefined || Math.max(rect.width, rect.height) < MIN_CHIP_RUN) continue;
    const text = fmt(value);
    const width = chipWidth(text);
    const chip = {
      kind,
      offScale,
      text,
      rect: {
        left: rect.left + rect.width / 2 - width / 2,
        top: rect.top + rect.height / 2 - CHIP_HEIGHT / 2,
        width,
        height: CHIP_HEIGHT,
      },
    };
    if (!placed.some((other) => intersect(chip.rect, other.rect))) placed.push(chip);
  }
  return placed;
}

function Chip({ kind, offScale, text, rect }: ChipProps) {
  return (
    <div
      className="lc-inspector__chip"
      data-kind={kind}
      data-off-scale={offScale || undefined}
      style={{ left: rect.left + rect.width / 2, top: rect.top + rect.height / 2 }}
    >
      {text}
    </div>
  );
}

function Label({ spec, tools }: { spec: Spec; tools: ToolSet }) {
  const { rect } = spec;
  const above = rect.top >= 28;
  const style: CSSProperties = {
    left: Math.max(4, Math.min(rect.left, window.innerWidth - LABEL_MAX_WIDTH - 4)),
    top: above ? rect.top - 4 : rect.top + rect.height + 4,
    maxWidth: LABEL_MAX_WIDTH,
    transform: above ? 'translateY(-100%)' : undefined,
  };
  return (
    <div className="lc-inspector__label" data-off-scale={hasIssues(buildReport(spec, tools)) || undefined} style={style}>
      <span className="lc-inspector__label-name">{spec.anchor ?? spec.name}</span>
      <span className="lc-inspector__label-meta">{buildLabel(spec, tools)}</span>
    </div>
  );
}

/** Full enabled layers for one element: fills, then the outline, then value chips so nothing covers them. */
function Layers({ spec, tools, withLabel }: { spec: Spec; tools: ToolSet; withLabel: boolean }) {
  const marks = marksFor(spec, tools);
  return (
    <>
      {marks.map((mark, i) => (
        <div
          key={i}
          className={`lc-inspector__${mark.kind}`}
          data-off-scale={mark.offScale || undefined}
          style={box(mark.rect)}
        />
      ))}
      <div className="lc-inspector__outline" data-pinned={!withLabel || undefined} style={box(spec.rect)} />
      {placeChips(marks).map((chip, i) => (
        <Chip key={i} {...chip} />
      ))}
      {withLabel && <Label spec={spec} tools={tools} />}
    </>
  );
}

interface InspectorOverlayProps {
  hovered: Spec | null;
  pinned: Spec | null;
  tools: ToolSet;
}

/**
 * Draws over the page without catching the pointer. With nothing pinned the
 * hovered element gets every enabled layer; once something is pinned it keeps
 * the layers and the hovered element only gets an outline and label.
 */
export function InspectorOverlay({ hovered, pinned, tools }: InspectorOverlayProps) {
  return (
    <div className="lc-inspector__overlay" aria-hidden="true">
      {pinned && <Layers spec={pinned} tools={tools} withLabel={false} />}
      {hovered &&
        (pinned ? (
          <>
            <div className="lc-inspector__outline" style={box(hovered.rect)} />
            <Label spec={hovered} tools={tools} />
          </>
        ) : (
          <Layers spec={hovered} tools={tools} withLabel />
        ))}
    </div>
  );
}
