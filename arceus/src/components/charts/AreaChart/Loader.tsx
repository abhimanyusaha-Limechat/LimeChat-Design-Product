
import classNames from "classnames";

import type { ChartLoaderProps } from "@/components/charts/shared/types";
import Container from "@/components/core/Container";
import Skeleton from "@/components/core/Skeleton";

import styles from "@/components/charts/AreaChart/AreaChart.module.sass";

const CHART_LEFT = 12;
const CHART_RIGHT = 92;
const CHART_TOP = 16;
const CHART_BOTTOM = 82;
const CHART_WIDTH = CHART_RIGHT - CHART_LEFT;
const CHART_HEIGHT = CHART_BOTTOM - CHART_TOP;

function AreaChartLoader({
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
      aria-label="Loading area chart"
    >
      <Container className={classNames(styles["loader-frame"])} fluid p={0}>
        {showAxes && (
          <>
            <Skeleton
              animate={animate}
              width={4}
              height={`${CHART_HEIGHT}%`}
              className={styles["axis-y"] ?? ""}
              style={{ left: `${CHART_LEFT}%`, top: `${CHART_TOP}%` }}
            />
            <Skeleton
              animate={animate}
              width={`${CHART_WIDTH}%`}
              height={4}
              className={styles["axis-x"] ?? ""}
              style={{ left: `${CHART_LEFT}%`, top: `${CHART_BOTTOM}%` }}
            />
          </>
        )}

        <Skeleton
          animate={animate}
          width={`${CHART_WIDTH}%`}
          height={`${CHART_HEIGHT}%`}
          className={classNames(styles["area-shape"], styles["area-primary"])}
          style={{ left: `${CHART_LEFT}%`, top: `${CHART_TOP}%` }}
        />
      </Container>
    </Container>
  );
}

export default AreaChartLoader;
