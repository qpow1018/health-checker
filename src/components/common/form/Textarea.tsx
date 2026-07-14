import styles from "./textarea.module.scss";

export default function Textarea(props: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
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
    placeholder,
    rows = 3,
    helperText,
    errorMessage,
    isRequired = false,
    isDisabled = false,
    className,
  } = props;
  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = errorMessage ? `${id}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(" ");
  const fieldClassName = [styles["textarea-field"], className].filter(Boolean).join(" ");

  return (
    <div className={fieldClassName}>
      <label className={styles["textarea-label"]} htmlFor={id}>
        {label}
      </label>
      <span className={styles["textarea-control-shell"]}>
        <textarea
          aria-describedby={describedBy || undefined}
          aria-invalid={errorMessage ? true : undefined}
          className={styles["textarea-control"]}
          disabled={isDisabled}
          id={id}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={isRequired}
          rows={rows}
          value={value}
        />
      </span>
      {helperText && (
        <span className={styles["textarea-helper-message"]} id={helperId}>
          {helperText}
        </span>
      )}
      {errorMessage && (
        <span className={styles["textarea-error-message"]} id={errorId}>
          {errorMessage}
        </span>
      )}
    </div>
  );
}
