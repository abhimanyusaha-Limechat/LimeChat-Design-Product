import React, { useMemo } from "react";
import classNames from "classnames";

import type { ChartLoaderProps } from "@/components/charts/shared/types";
import Container from "@/components/core/Container";
import Skeleton from "@/components/core/Skeleton";

import styles from "@/components/charts/BarChart/BarChart.module.sass";

const BAR_PATTERN = [68, 42, 85, 58, 92, 63, 77, 49];
const MAX_BARS = 12;
const MIN_BARS = 1;

const CHART_LEFT = 12;
const CHART_RIGHT = 92;
const CHART_TOP = 18;
const CHART_BOTTOM = 84;
const CHART_WIDTH = CHART_RIGHT - CHART_LEFT;
const CHART_HEIGHT = CHART_BOTTOM - CHART_TOP;

const clampBarCount = (count?: number): number => {
  if (typeof count !== "number" || Number.isNaN(count)) {
    return Math.max(MIN_BARS, Math.min(6, MAX_BARS));
  }
  return Math.min(Math.max(Math.round(count), MIN_BARS), MAX_BARS);
};

interface BarPosition {
  left: number;
  width: number;
  top: number;
  height: number;
  highlightTop: number;
  highlightHeight: number;
  delay: number;
}

const buildBarPositions = (bars: number[]): BarPosition[] => {
  if (bars.length === 0) return [];

  const step = CHART_WIDTH / bars.length;
  const width = step * 0.55;

  return bars.map((rawValue, index) => {
    const boundedValue = Math.min(Math.max(rawValue, 5), 95);
    const heightPercent = (boundedValue / 100) * CHART_HEIGHT;
    const top = CHART_BOTTOM - heightPercent;
    const left = CHART_LEFT + step * index + (step - width) / 2;
    const highlightHeight = heightPercent * 0.35;
    const highlightTop = CHART_BOTTOM - highlightHeight;

    return {
      left,
      width,
      top,
      height: heightPercent,
      highlightTop,
      highlightHeight,
      delay: (index % BAR_PATTERN.length) * 0.08,
    };
  });
};

function BarChartLoader({
  height = 320,
  width = "100%",
  className,
  barCount = 6,
  showAxes = true,
  animate = true,
}: ChartLoaderProps): JSX.Element {
  const bars = useMemo<number[]>(() => {
    const total = clampBarCount(barCount);
    const result: number[] = [];
    for (let index = 0; index < total; index += 1) {
      const patternIndex = index % BAR_PATTERN.length;
      result.push(BAR_PATTERN[patternIndex]!);
    }
    return result;
  }, [barCount]);

  const positions = useMemo(() => buildBarPositions(bars), [bars]);

  return (
    <Container
      className={classNames(styles.loader, className, animate && styles.static)}
      style={{ height, width }}
      role="status"
      aria-label="Loading bar chart"
    >
      <Container className={classNames(styles["loader-frame"])} fluid p={0}>
        {showAxes && (
          <>
            <Skeleton
              animate={animate}
              width={4}
              height={`${CHART_HEIGHT}%`}
              className={classNames(styles["axis-y"])}
              style={{ left: `${CHART_LEFT}%`, top: `${CHART_TOP}%` }}
            />
            <Skeleton
              animate={animate}
              width={`${CHART_WIDTH}%`}
              height={4}
              className={classNames(styles["axis-x"])}
              style={{ left: `${CHART_LEFT}%`, top: `${CHART_BOTTOM}%` }}
            />
          </>
        )}

        {positions.map((bar, index) => (
          <React.Fragment key={`bar-${index}`}>
            <Skeleton
              animate={animate}
              width={`${bar.width}%`}
              height={`${bar.height}%`}
              className={classNames(styles["bar-primary"])}
              style={{ left: `${bar.left}%`, top: `${bar.top}%`, animationDelay: `${bar.delay}s` }}
            />
            <Skeleton
              animate={animate}
              width={`${bar.width}%`}
              height={`${bar.highlightHeight}%`}
              className={classNames(styles["bar-highlight"])}
              style={{
                left: `${bar.left}%`,
                top: `${bar.highlightTop}%`,
                animationDelay: `${bar.delay}s`,
              }}
            />
          </React.Fragment>
        ))}
      </Container>
    </Container>
  );
}

export default BarChartLoader;
