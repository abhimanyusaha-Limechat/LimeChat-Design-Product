import type { RefObject } from "react";
import { useState, useEffect, useRef } from "react";

interface UseChartResponsiveProps {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  defaultWidth?: number | string;
  defaultHeight?: number | string;
}

interface ChartDimensions {
  width: number | string;
  height: number | string;
}

const useChartResponsive = ({
  responsive = true,
  maintainAspectRatio = false,
  defaultWidth = "100%",
  defaultHeight = 400,
}: UseChartResponsiveProps = {}): [ChartDimensions, RefObject<HTMLDivElement>] => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<ChartDimensions>({
    width: defaultWidth,
    height: defaultHeight,
  });

  useEffect(() => {
    if (!responsive || !containerRef.current) {
      return undefined;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const { width } = entry.contentRect;

        if (maintainAspectRatio && typeof defaultHeight === "number") {
          const aspectRatio = 16 / 9;
          const newHeight = width / aspectRatio;
          setDimensions({
            width: "100%",
            height: newHeight,
          });
        } else {
          setDimensions({
            width: "100%",
            height: defaultHeight,
          });
        }
      });
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [responsive, maintainAspectRatio, defaultHeight]);

  return [dimensions, containerRef];
};

export default useChartResponsive;
