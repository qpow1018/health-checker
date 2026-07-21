import styles from "./textInput.module.scss";

type TTextInputType =
  | "email"
  | "password"
  | "search"
  | "tel"
  | "text"
  | "time"
  | "url";
type TTextInputMode =
  | "decimal"
  | "email"
  | "none"
  | "numeric"
  | "search"
  | "tel"
  | "text"
  | "url";

export default function TextInput(props: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  type?: TTextInputType;
  inputMode?: TTextInputMode;
  placeholder?: string;
  autoComplete?: string;
  maxLength?: number;
  isDisabled?: boolean;
  className?: string;
}) {
  const {
    id,
    value,
    onChange,
    type = "text",
    inputMode,
    placeholder,
    autoComplete,
    maxLength,
    isDisabled = false,
    className,
  } = props;

  const fieldClassName = [styles["text-input"], className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={fieldClassName}>
      <input
        autoComplete={autoComplete}
        disabled={isDisabled}
        id={id}
        inputMode={inputMode}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </div>
  );
}
