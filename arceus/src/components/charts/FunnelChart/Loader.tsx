
import classNames from "classnames";

import type { ChartLoaderProps } from "@/components/charts/shared/types";
import Container from "@/components/core/Container";
import Skeleton from "@/components/core/Skeleton";

import styles from "@/components/charts/FunnelChart/FunnelChart.module.sass";

interface StageConfig {
  width: number;
  delay: number;
}

const STAGES: StageConfig[] = [
  { width: 100, delay: 0 },
  { width: 75, delay: 0.1 },
  { width: 50, delay: 0.2 },
  { width: 25, delay: 0.3 },
];

function FunnelChartLoader({
  height = 320,
  width = "100%",
  className,
  animate = true,
}: ChartLoaderProps): JSX.Element {
  return (
    <Container
      className={classNames(styles.loader, className, !animate && styles.static)}
      style={{ height, width }}
      role="status"
      aria-label="Loading funnel chart"
    >
      <Container className={classNames(styles["loader-frame"])} fluid p={0}>
        {STAGES.map((stage, index) => (
          <Container key={`stage-${index}`} className={classNames(styles["stage-row"])} fluid p={0}>
            <Skeleton
              animate={animate}
              width={`${stage.width}%`}
              height={48}
              className={classNames(styles["stage-shape"])}
              style={{ animationDelay: `${stage.delay}s` }}
            />
          </Container>
        ))}
      </Container>
    </Container>
  );
}

export default FunnelChartLoader;
