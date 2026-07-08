import type { InputHTMLAttributes } from "react";

import styles from "./textInput.module.scss";

type TTextInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
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

export function TextInput({
  id,
  label,
  value,
  onChange,
  helperText,
  errorMessage,
  isDisabled = false,
  className,
  type = "text",
  ...props
}: TTextInputProps) {
  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = errorMessage ? `${id}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(" ");

  return (
    <div className={`${styles.field} ${className ?? ""}`}>
      <label className={styles["field-label"]} htmlFor={id}>
        {label}
      </label>
      <span className={styles["control-shell"]}>
        <input
          {...props}
          aria-describedby={describedBy || undefined}
          aria-invalid={errorMessage ? true : undefined}
          className={styles.control}
          disabled={isDisabled}
          id={id}
          onChange={(event) => onChange(event.target.value)}
          type={type}
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
