
import classNames from "classnames";

import type { ChartLoaderProps } from "@/components/charts/shared/types";
import Container from "@/components/core/Container";
import Skeleton from "@/components/core/Skeleton";

import styles from "@/components/charts/LineChart/LineChart.module.sass";

const CHART_LEFT = 10;
const CHART_RIGHT = 90;
const CHART_TOP = 10;
const CHART_BOTTOM = 70;
const CHART_WIDTH = CHART_RIGHT - CHART_LEFT;
const CHART_HEIGHT = CHART_BOTTOM - CHART_TOP;

function LineChartLoader({
  height = 320,
  width = "100%",
  className,
  showAxes = true,
  animate = true,
}: ChartLoaderProps): JSX.Element {
  return (
    <Container
      className={classNames(styles.loader, className, !animate && styles.static)}
      style={{ height, width }}
      role="status"
      aria-label="Loading line chart"
    >
      <Container className={classNames(styles["loader-frame"])} fluid p={0}>
        {showAxes && (
          <>
            <Skeleton
              animate={animate}
              width={3}
              height={`${CHART_HEIGHT}%`}
              className={classNames(styles["axis-y"])}
              style={{ left: `${CHART_LEFT}%`, top: `${CHART_TOP}%` }}
            />
            <Skeleton
              animate={animate}
              width={`${CHART_WIDTH}%`}
              height={3}
              className={classNames(styles["axis-x"])}
              style={{ left: `${CHART_LEFT}%`, top: `${CHART_BOTTOM}%` }}
            />
          </>
        )}

        <Skeleton
          animate={animate}
          width={`${CHART_WIDTH}%`}
          height={`${CHART_HEIGHT}%`}
          className={classNames(styles["line-shape"], styles["line-primary"])}
          style={{ left: `${CHART_LEFT}%`, top: `${CHART_TOP}%` }}
        />
      </Container>
    </Container>
  );
}

export default LineChartLoader;
