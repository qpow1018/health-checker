import type { MouseEventHandler, ReactNode } from "react";

import styles from "./button.module.scss";

type TButtonType = "button" | "submit";
export type TButtonColor = "primary" | "accent" | "gray" | "danger";
type TButtonFill = "solid" | "soft" | "outline" | "ghost";
type TButtonSize = "small" | "medium" | "large";

export default function Button(props: {
  type?: TButtonType;
  color?: TButtonColor;
  fill?: TButtonFill;
  size?: TButtonSize;
  className?: string;
  isFullWidth?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
  "aria-expanded"?: boolean;
  "aria-haspopup"?: "dialog";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children?: ReactNode;
}) {
  const {
    type = "button",
    color = "gray",
    fill = "solid",
    size = "medium",
    className = "",
    isFullWidth = false,
    isLoading = false,
    isDisabled = false,
    onClick,
    children,
  } = props;

  const resolvedFill = fill ?? getDefaultFill(color);
  const buttonClassName = [
    styles.button,
    styles[`color-${color}`],
    styles[`fill-${resolvedFill}`],
    styles[`size-${size}`],
    isFullWidth ? styles["is-full-width"] : "",
    isLoading ? styles["is-loading"] : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      aria-busy={isLoading ? true : undefined}
      aria-expanded={props["aria-expanded"]}
      aria-haspopup={props["aria-haspopup"]}
      className={buttonClassName}
      data-color={color}
      data-fill={resolvedFill}
      data-full-width={isFullWidth ? true : undefined}
      data-size={size}
      disabled={isDisabled || isLoading}
      onClick={onClick}
      type={type}
    >
      {children}
      {isLoading && <span className={styles.spinner} aria-hidden="true" />}
    </button>
  );
}

function getDefaultFill(color: TButtonColor): TButtonFill {
  if (color === "primary" || color === "accent") {
    return "solid";
  }

  if (color === "danger") {
    return "soft";
  }

  return "outline";
}
