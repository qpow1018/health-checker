import type { TextareaHTMLAttributes } from "react";

import styles from "./textarea.module.scss";

type TTextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "className" | "disabled" | "id" | "onChange" | "value"
> & {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
  errorMessage?: string;
  isDisabled?: boolean;
  className?: string;
};

export function Textarea({
  id,
  label,
  value,
  onChange,
  helperText,
  errorMessage,
  isDisabled = false,
  className,
  rows = 3,
  ...props
}: TTextareaProps) {
  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = errorMessage ? `${id}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(" ");

  return (
    <div className={`${styles.field} ${className ?? ""}`}>
      <label className={styles["field-label"]} htmlFor={id}>
        {label}
      </label>
      <span className={styles["control-shell"]}>
        <textarea
          {...props}
          aria-describedby={describedBy || undefined}
          aria-invalid={errorMessage ? true : undefined}
          className={`${styles.control} ${styles.textarea}`}
          disabled={isDisabled}
          id={id}
          onChange={(event) => onChange(event.target.value)}
          rows={rows}
          value={value}
        />
      </span>
      {helperText && (
        <span className={styles["helper-message"]} id={helperId}>
          {helperText}
        </span>
      )}
      {errorMessage && (
        <span className={styles["error-message"]} id={errorId}>
          {errorMessage}
        </span>
      )}
    </div>
  );
}
