
import classNames from "classnames";

import type { ChartLoaderProps } from "@/components/charts/shared/types";
import Container from "@/components/core/Container";
import Skeleton from "@/components/core/Skeleton";

import styles from "@/components/charts/PieChart/PieChart.module.sass";

function PieChartLoader({
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
      aria-label="Loading pie chart"
    >
      <Container className={classNames(styles["loader-frame"])} fluid p={0}>
        <Container className={classNames(styles["chart-face"])} fluid p={0}>
          <Skeleton
            animate={animate}
            circle
            height={200}
            width={200}
            className={classNames(styles["pie-base"])}
          />

          <Skeleton
            animate={animate}
            circle
            height={84}
            width={84}
            className={classNames(styles["pie-center"])}
          />
        </Container>
      </Container>
    </Container>
  );
}

export default PieChartLoader;
