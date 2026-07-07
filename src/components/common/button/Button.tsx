import type { ButtonHTMLAttributes, ReactNode } from "react";

import styles from "./button.module.scss";

export type TButtonVariant = "primary" | "secondary" | "destructive";
export type TButtonAppearance = "solid" | "soft" | "outline" | "ghost";
export type TButtonSize = "small" | "medium" | "large";

type TButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "disabled"> & {
  variant?: TButtonVariant;
  appearance?: TButtonAppearance;
  size?: TButtonSize;
  isFullWidth?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
  children: ReactNode;
};

export function Button({
  variant = "secondary",
  appearance,
  size = "medium",
  isFullWidth = false,
  isLoading = false,
  isDisabled = false,
  className,
  children,
  type = "button",
  ...props
}: TButtonProps) {
  const resolvedAppearance = appearance ?? getDefaultAppearance(variant);
  const buttonClassName = [
    styles.button,
    styles[`variant-${variant}`],
    styles[`appearance-${resolvedAppearance}`],
    styles[`size-${size}`],
    isFullWidth ? styles["is-full-width"] : "",
    isLoading ? styles["is-loading"] : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...props}
      aria-busy={isLoading ? true : undefined}
      className={buttonClassName}
      data-appearance={resolvedAppearance}
      data-full-width={isFullWidth ? true : undefined}
      data-size={size}
      data-variant={variant}
      disabled={isDisabled || isLoading}
      type={type}
    >
      <span className={styles.label}>{children}</span>
      {isLoading ? <span className={styles.spinner} aria-hidden="true" /> : null}
    </button>
  );
}

function getDefaultAppearance(variant: TButtonVariant): TButtonAppearance {
  if (variant === "primary") {
    return "solid";
  }

  if (variant === "destructive") {
    return "soft";
  }

  return "outline";
}
