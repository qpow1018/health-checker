"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, RefObject } from "react";

import styles from "./wheelPicker.module.scss";

const ITEM_HEIGHT = 40;
const SETTLE_DELAY = 100;
const LOOP_COUNT = 5;
const EDGE_BUFFER = 2;
const CYLINDER_RADIUS = 90;
const CYLINDER_ANGLE = 26;

export type TWheelPickerOption = {
  value: string;
  label: string;
};

export default function WheelPicker(props: {
  ariaLabel: string;
  options: TWheelPickerOption[];
  value: string;
  onChange: (value: string) => void;
  focusRef?: RefObject<HTMLDivElement | null>;
  isInfinite?: boolean;
}) {
  const { ariaLabel, options, value, onChange, focusRef, isInfinite = false } = props;
  const scrollRef = useRef<HTMLDivElement>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isInitialPositionedRef = useRef(false);
  const optionIdPrefix = useId();
  const virtualOptions = useMemo(
    () => getVirtualOptions(options, isInfinite),
    [isInfinite, options],
  );
  const [activeOptionIndex, setActiveOptionIndex] = useState(() =>
    getInitialOptionIndex(options, value, isInfinite),
  );
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const scrollElement = scrollRef.current;

    if (!scrollElement) {
      return;
    }

    const currentOptionIndex = getCurrentOptionIndex(scrollElement, virtualOptions.length);
    const targetOptionIndex = isInitialPositionedRef.current
      ? getClosestOptionIndex(virtualOptions, value, currentOptionIndex)
      : getInitialOptionIndex(options, value, isInfinite);

    isInitialPositionedRef.current = true;
    setActiveOptionIndex(targetOptionIndex);

    if (currentOptionIndex !== targetOptionIndex) {
      scrollToOption(targetOptionIndex);
    }
  }, [isInfinite, options, value, virtualOptions]);

  useEffect(() => {
    return () => {
      clearTimeout(settleTimerRef.current);
    };
  }, []);

  function getOptionId(optionIndex: number) {
    return `${optionIdPrefix}-${optionIndex}`;
  }

  function scrollToOption(optionIndex: number) {
    const scrollElement = scrollRef.current;

    if (!scrollElement) {
      return;
    }

    const top = optionIndex * ITEM_HEIGHT;
    setScrollTop(top);

    if (typeof scrollElement.scrollTo === "function") {
      scrollElement.scrollTo({ top });
      return;
    }

    scrollElement.scrollTop = top;
  }

  function handleScroll() {
    const scrollElement = scrollRef.current;

    if (scrollElement) {
      setScrollTop(scrollElement.scrollTop);
    }

    clearTimeout(settleTimerRef.current);
    settleTimerRef.current = setTimeout(() => {
      const scrollElement = scrollRef.current;

      if (!scrollElement) {
        return;
      }

      const optionIndex = getCurrentOptionIndex(scrollElement, virtualOptions.length);
      const nextOption = virtualOptions[optionIndex];

      if (!nextOption) {
        return;
      }

      setActiveOptionIndex(optionIndex);

      if (nextOption.option.value !== value) {
        onChange(nextOption.option.value);
      }

      if (isInfinite && isNearEdge(optionIndex, virtualOptions.length)) {
        const centeredOptionIndex = getInitialOptionIndex(
          options,
          nextOption.option.value,
          true,
        );

        setActiveOptionIndex(centeredOptionIndex);
        scrollToOption(centeredOptionIndex);
      }
    }, SETTLE_DELAY);
  }

  function selectOption(optionIndex: number) {
    const nextOption = virtualOptions[optionIndex];

    if (!nextOption) {
      return;
    }

    setActiveOptionIndex(optionIndex);
    scrollToOption(optionIndex);

    if (nextOption.option.value !== value) {
      onChange(nextOption.option.value);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const nextOptionIndex = getNextOptionIndex(
      event.key,
      activeOptionIndex,
      options.length,
      virtualOptions.length,
      isInfinite,
    );

    if (nextOptionIndex === undefined) {
      return;
    }

    event.preventDefault();
    selectOption(nextOptionIndex);
  }

  return (
    <div
      aria-activedescendant={getOptionId(activeOptionIndex)}
      aria-label={ariaLabel}
      className={styles["wheel-picker"]}
      onKeyDown={handleKeyDown}
      ref={focusRef}
      role="listbox"
      tabIndex={0}
    >
      <div className={styles["wheel-picker-selection"]} aria-hidden="true" />
      <div
        className={styles["wheel-picker-scroll"]}
        onScroll={handleScroll}
        ref={scrollRef}
      >
        {virtualOptions.map((virtualOption, optionIndex) => {
          const isSelected = optionIndex === activeOptionIndex;
          const style = getOptionStyle(optionIndex, scrollTop);

          return (
            <div
              aria-selected={isSelected}
              className={styles["wheel-picker-option"]}
              data-selected={isSelected ? true : undefined}
              id={getOptionId(optionIndex)}
              key={`${virtualOption.option.value}-${virtualOption.loopIndex}`}
              onClick={() => selectOption(optionIndex)}
              role="option"
            >
              <span className={styles["wheel-picker-option-label"]} style={style}>
                {virtualOption.option.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getOptionStyle(optionIndex: number, scrollTop: number): CSSProperties {
  const distanceFromCenter = Math.min(
    Math.max((optionIndex * ITEM_HEIGHT - scrollTop) / ITEM_HEIGHT, -2.75),
    2.75,
  );
  const absoluteDistance = Math.abs(distanceFromCenter);
  const rotation = distanceFromCenter * CYLINDER_ANGLE;
  const rotationInRadians = (rotation * Math.PI) / 180;
  const cylinderY = Math.sin(rotationInRadians) * CYLINDER_RADIUS;
  const cylinderDepth = Math.cos(rotationInRadians) * CYLINDER_RADIUS - CYLINDER_RADIUS;
  const verticalOffset = cylinderY - distanceFromCenter * ITEM_HEIGHT;

  return {
    fontSize: `${18 - absoluteDistance * 1.8}px`,
    opacity: Math.max(1 - absoluteDistance * 0.3, 0.12),
    transform: `perspective(260px) translateY(${verticalOffset}px) translateZ(${cylinderDepth}px) rotateX(${-rotation}deg) scale(${1 - absoluteDistance * 0.055})`,
  };
}

function getVirtualOptions(options: TWheelPickerOption[], isInfinite: boolean) {
  const loopCount = isInfinite ? LOOP_COUNT : 1;

  return Array.from({ length: options.length * loopCount }, (_, index) => ({
    option: options[index % options.length],
    loopIndex: Math.floor(index / options.length),
  }));
}

function getInitialOptionIndex(
  options: TWheelPickerOption[],
  value: string,
  isInfinite: boolean,
) {
  const optionIndex = Math.max(
    options.findIndex((option) => option.value === value),
    0,
  );

  if (!isInfinite) {
    return optionIndex;
  }

  return options.length * Math.floor(LOOP_COUNT / 2) + optionIndex;
}

function getClosestOptionIndex(
  virtualOptions: ReturnType<typeof getVirtualOptions>,
  value: string,
  currentOptionIndex: number,
) {
  return virtualOptions.reduce((closestOptionIndex, virtualOption, optionIndex) => {
    if (virtualOption.option.value !== value) {
      return closestOptionIndex;
    }

    return Math.abs(optionIndex - currentOptionIndex) <
      Math.abs(closestOptionIndex - currentOptionIndex)
      ? optionIndex
      : closestOptionIndex;
  }, 0);
}

function getCurrentOptionIndex(scrollElement: HTMLDivElement, optionsLength: number) {
  return Math.min(Math.max(Math.round(scrollElement.scrollTop / ITEM_HEIGHT), 0), optionsLength - 1);
}

function getNextOptionIndex(
  key: string,
  currentOptionIndex: number,
  logicalOptionsLength: number,
  virtualOptionsLength: number,
  isInfinite: boolean,
) {
  if (key === "ArrowUp") {
    if (isInfinite && currentOptionIndex === 0) {
      return virtualOptionsLength - logicalOptionsLength - 1;
    }

    return Math.max(currentOptionIndex - 1, 0);
  }

  if (key === "ArrowDown") {
    if (isInfinite && currentOptionIndex === virtualOptionsLength - 1) {
      return logicalOptionsLength;
    }

    return Math.min(currentOptionIndex + 1, virtualOptionsLength - 1);
  }

  if (key === "Home") {
    return isInfinite ? logicalOptionsLength * Math.floor(LOOP_COUNT / 2) : 0;
  }

  if (key === "End") {
    return isInfinite
      ? logicalOptionsLength * Math.floor(LOOP_COUNT / 2) + logicalOptionsLength - 1
      : virtualOptionsLength - 1;
  }

  return undefined;
}

function isNearEdge(optionIndex: number, optionsLength: number) {
  return optionIndex < EDGE_BUFFER || optionIndex >= optionsLength - EDGE_BUFFER;
}
