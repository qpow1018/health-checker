import styles from "./textInput.module.scss";

type TTextInputType = "email" | "password" | "search" | "tel" | "text" | "url";
type TTextInputMode = "decimal" | "email" | "none" | "numeric" | "search" | "tel" | "text" | "url";

export function TextInput(props: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: TTextInputType;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: TTextInputMode;
  helperText?: string;
  errorMessage?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  className?: string;
}) {
  const {
    id,
    label,
    value,
    onChange,
    type = "text",
    placeholder,
    autoComplete,
    inputMode,
    helperText,
    errorMessage,
    isRequired = false,
    isDisabled = false,
    className,
  } = props;
  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = errorMessage ? `${id}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(" ");
  const fieldClassName = [styles["text-input"], className].filter(Boolean).join(" ");

  return (
    <div className={fieldClassName}>
      <label className={styles["text-input-label"]} htmlFor={id}>
        {label}
      </label>
      <span className={styles["text-input-control-shell"]}>
        <input
          aria-describedby={describedBy || undefined}
          aria-invalid={errorMessage ? true : undefined}
          autoComplete={autoComplete}
          className={styles["text-input-control"]}
          disabled={isDisabled}
          id={id}
          inputMode={inputMode}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={isRequired}
          type={type}
          value={value}
        />
      </span>
      {helperText && (
        <span className={styles["text-input-helper-message"]} id={helperId}>
          {helperText}
        </span>
      )}
      {errorMessage && (
        <span className={styles["text-input-error-message"]} id={errorId}>
          {errorMessage}
        </span>
      )}
    </div>
  );
}
