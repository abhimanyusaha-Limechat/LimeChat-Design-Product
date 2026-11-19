import { forwardRef } from "react";
import { Checkbox, Text } from "@mantine/core";
import classNames from "classnames";
import Box from "@/components/core/Container";

import type { InteractiveLegendProps } from "@/components/charts/shared/components/InteractiveLegend/types";
import styles from "@/components/charts/shared/components/InteractiveLegend/InteractiveLegend.module.sass";

const InteractiveLegend = forwardRef<HTMLDivElement, InteractiveLegendProps>(
  (
    {
      datasets,
      visibleDatasets,
      onToggle,
      onToggleAll,
      position = "right",
      className,
      showToggleAll = false,
    },
    ref,
  ) => {
    const positionClass = styles[`legend--${position}`];

    return (
      <Box
        p={0}
        ref={ref}
        role="group"
        className={classNames(styles.legend, positionClass, className)}
      >
        {showToggleAll && datasets.length > 1 && (
          <Box p={0}>
            <Checkbox
              checked={visibleDatasets.size === datasets.length}
              indeterminate={visibleDatasets.size > 0 && visibleDatasets.size < datasets.length}
              label="Toggle All"
              onChange={onToggleAll}
            />
          </Box>
        )}

        <Box className={styles["legend-items"] ?? ""} p={0}>
          {datasets.map((dataset) => (
            <Box key={dataset.key} className={styles["legend-item"] ?? ""} p={0}>
              <Checkbox
                checked={visibleDatasets.has(dataset.key)}
                onChange={() => onToggle(dataset.key)}
                label={
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--mantine-spacing-2xs)",
                    }}
                  >
                    <span
                      style={{
                        width: "var(--mantine-spacing-sm)",
                        height: "var(--mantine-spacing-sm)",
                        borderRadius: "var(--mantine-spacing-3xs)",
                        backgroundColor: dataset.color,
                        flexShrink: 0,
                      }}
                    />
                    <Text size="sm" style={{ color: "var(--mantine-color-text)" }}>
                      {dataset.name}
                    </Text>
                  </span>
                }
                aria-label={`Toggle ${dataset.name}`}
              />
            </Box>
          ))}
        </Box>
      </Box>
    );
  },
);

InteractiveLegend.displayName = "InteractiveLegend";

export default InteractiveLegend;
export type { InteractiveLegendProps } from "@/components/charts/shared/components/InteractiveLegend/types";
