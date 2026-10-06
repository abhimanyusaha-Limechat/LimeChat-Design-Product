import type { CSSProperties } from 'react';
import { isOnSpacingGrid } from './designScale';
import type { Rect, Spec } from './measure';
import { buildLabel, buildReport, fmt, hasIssues, type ToolSet } from './report';

/** Bands and strips thinner than this (rendered px) skip their number. */
const MIN_LABELLED = 12;
const LABEL_MAX_WIDTH = 280;

const box = ({ left, top, width, height }: Rect): CSSProperties => ({ left, top, width, height });

function Measure({ rect, value, kind }: { rect: Rect; value: number; kind: 'padding' | 'gap' }) {
  if (rect.width <= 0 || rect.height <= 0) return null;
  const labelled = Math.min(rect.width, rect.height) >= MIN_LABELLED;
  return (
    <div
      className={`lc-inspector__${kind}`}
      data-off-scale={!isOnSpacingGrid(value) || undefined}
      style={box(rect)}
    >
      {labelled && fmt(value)}
    </div>
  );
}

/** Shaded padding bands, inside the border, at the element's rendered scale. */
function PaddingBands({ spec }: { spec: Spec }) {
  const { rect, padding: p, border: b, scale: s } = spec;
  const inner = {
    left: rect.left + b.left * s,
    top: rect.top + b.top * s,
    width: rect.width - (b.left + b.right) * s,
    height: rect.height - (b.top + b.bottom) * s,
  };
  const middleTop = inner.top + p.top * s;
  const middleHeight = inner.height - (p.top + p.bottom) * s;
  return (
    <>
      <Measure kind="padding" value={p.top} rect={{ ...inner, height: p.top * s }} />
      <Measure
        kind="padding"
        value={p.bottom}
        rect={{ ...inner, top: inner.top + inner.height - p.bottom * s, height: p.bottom * s }}
      />
      <Measure
        kind="padding"
        value={p.left}
        rect={{ left: inner.left, top: middleTop, width: p.left * s, height: middleHeight }}
      />
      <Measure
        kind="padding"
        value={p.right}
        rect={{ left: inner.left + inner.width - p.right * s, top: middleTop, width: p.right * s, height: middleHeight }}
      />
    </>
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
      <span className="lc-inspector__label-name">{spec.anchor ?? spec.name}</span> {buildLabel(spec, tools)}
    </div>
  );
}

/** Full enabled layers for one element. */
function Layers({ spec, tools, withLabel }: { spec: Spec; tools: ToolSet; withLabel: boolean }) {
  const gap = spec.gap;
  return (
    <>
      {tools.padding && spec.drawBands && <PaddingBands spec={spec} />}
      {tools.gap &&
        gap &&
        spec.gapStrips.map(({ rect, axis }, i) => (
          <Measure
            key={i}
            kind="gap"
            value={axis === 'column' ? gap.column : gap.row}
            rect={rect}
          />
        ))}
      <div className="lc-inspector__outline" data-pinned={!withLabel || undefined} style={box(spec.rect)} />
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
