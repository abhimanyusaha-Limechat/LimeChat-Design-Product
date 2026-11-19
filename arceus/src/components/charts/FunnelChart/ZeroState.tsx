
import { Text } from "@mantine/core";
import { IconChartInfographic } from "@tabler/icons-react";
import classNames from "classnames";
import Container from "@/components/core/Container";
import type { ChartZeroStateProps } from "@/components/charts/shared/types";
import styles from "@/components/charts/FunnelChart/FunnelChart.module.sass";

function FunnelChartZeroState({
  message = "No data to display in funnel chart",
  height = 400,
  width = "100%",
  className,
  icon,
  showIcon = true,
}: ChartZeroStateProps) {
  return (
    <Container
      className={classNames(styles["zero-state"], className)}
      style={{ height, width }}
      fluid
      p={0}
    >
      <Container className={classNames(styles["zero-state-content"])} fluid p={0}>
        {showIcon && (
          <Container className={classNames(styles["zero-state-icon"])} fluid p={0}>
            {icon ?? <IconChartInfographic size={48} stroke={1.5} />}
          </Container>
        )}
        <Text className={styles["zero-state-message"] ?? ""} size="md" color="light">
          {message}
        </Text>
      </Container>
    </Container>
  );
}

export default FunnelChartZeroState;
