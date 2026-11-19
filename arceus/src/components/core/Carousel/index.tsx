import * as React from "react";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Autoheight from "embla-carousel-auto-height";

import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useEffect, useMemo } from "react";

import ActionIcon from "@/components/core/ActionIcon";
import type { ActionIconProps } from "@/components/core/ActionIcon";
import styles from "@/components/core/Carousel/Carousel.module.sass";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  options?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
  autoPlay?: boolean;
  autoHeight?: boolean;
  loop?: boolean;
  delay?: number;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

function Carousel({
  orientation = "horizontal",
  options,
  plugins: carouselPlugins,
  setApi,
  className,
  children,
  autoPlay = false,
  autoHeight = false,
  loop = false,
  delay = 3000,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const plugins = [...(carouselPlugins ?? [])];

  if (autoPlay) {
    plugins.push(Autoplay({ delay, stopOnInteraction: true, stopOnMouseEnter: true }));
  }
  if (autoHeight) {
    plugins.push(Autoheight());
  }

  const [carouselRef, api] = useEmblaCarousel(
    {
      loop,
      ...options,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    [...plugins],
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((_api: CarouselApi) => {
    if (!_api) return;
    setCanScrollPrev(_api.canScrollPrev());
    setCanScrollNext(_api.canScrollNext());
  }, []);

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={useMemo(
        () => ({
          carouselRef,
          api,
          options,
          orientation,
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
        }),
        [
          carouselRef,
          api,
          options,
          orientation,
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
        ],
      )}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={`${styles.carouselContainer} ${className ?? ""}`}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div ref={carouselRef} className={styles.carouselContentWrapper} data-slot="carousel-content">
      <div
        className={`${styles.carouselContent} ${orientation === "horizontal" ? styles.horizontal : styles.vertical} ${className ?? ""}`}
        {...props}
      />
    </div>
  );
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel();

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={`${styles.carouselItem} ${orientation === "horizontal" ? styles.horizontal : styles.vertical} ${className ?? ""}`}
      {...props}
    />
  );
}

type CarouselButtonProps = {
  className?: string;
  variant?: "outline";
  size?: ActionIconProps["size"];
};

type CarouselButtonNativeProps = ActionIconProps & React.ComponentPropsWithoutRef<"button">;

function CarouselButton({
  className,
  variant = "outline",
  size = "sm",
  direction,
  ...props
}: CarouselButtonProps & {
  direction: "previous" | "next";
} & Omit<CarouselButtonNativeProps, keyof CarouselButtonProps>) {
  const { orientation, scrollPrev, scrollNext, canScrollPrev, canScrollNext } = useCarousel();

  const isPrevious = direction === "previous";
  const canScroll = isPrevious ? canScrollPrev : canScrollNext;
  const scroll = isPrevious ? scrollPrev : scrollNext;
  const Icon = isPrevious ? IconChevronLeft : IconChevronRight;
  const directionStyle = isPrevious ? styles.previous : styles.next;

  return (
    <ActionIcon
      data-slot={`carousel-${direction}`}
      variant={variant}
      radius="xl"
      size={size}
      className={`${styles.carouselButton}
        ${directionStyle}
        ${orientation === "horizontal" ? styles.horizontal : styles.vertical}
        ${className ?? ""}
      `}
      disabled={!canScroll}
      onClick={(e) => {
        e.stopPropagation();
        scroll();
      }}
      {...props}
    >
      <Icon />
    </ActionIcon>
  );
}

function CarouselPrevious(
  props: CarouselButtonProps & Omit<CarouselButtonNativeProps, keyof CarouselButtonProps>,
) {
  return <CarouselButton direction="previous" {...props} />;
}

function CarouselNext(
  props: CarouselButtonProps & Omit<CarouselButtonNativeProps, keyof CarouselButtonProps>,
) {
  return <CarouselButton direction="next" {...props} />;
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};
