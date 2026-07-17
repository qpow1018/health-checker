import styles from "./textarea.module.scss";

export default function Textarea(props: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  isDisabled?: boolean;
  className?: string;
}) {
  const {
    id,
    value,
    onChange,
    placeholder,
    rows = 3,
    isDisabled = false,
    className,
  } = props;

  const fieldClassName = [styles.textarea, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={fieldClassName}>
      <textarea
        disabled={isDisabled}
        id={id}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        value={value}
      />
    </div>
  );
}
