
import { Text } from "@mantine/core";
import { IconChartArea } from "@tabler/icons-react";
import classNames from "classnames";
import type { ChartZeroStateProps } from "@/components/charts/shared/types";
import Container from "@/components/core/Container";
import styles from "@/components/charts/AreaChart/AreaChart.module.sass";

function AreaChartZeroState({
  message = "No data to display in area chart",
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
            {icon ?? <IconChartArea size={48} stroke={1.5} />}
          </Container>
        )}
        <Text className={styles["zero-state-message"] ?? ""} size="md">
          {message}
        </Text>
      </Container>
    </Container>
  );
}

export default AreaChartZeroState;
