import styles from "./buttonGroup.module.scss";

export default function ButtonGroup(props: {
  label: string;
  options: ReadonlyArray<{
    value: string;
    label: string;
  }>;
  value: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
}) {
  const { label, options, value, onChange, isDisabled = false } = props;

  return (
    <div className={styles["button-group"]} role="group" aria-label={label}>
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <button
            aria-pressed={isSelected}
            className={isSelected ? styles["selected-option"] : undefined}
            disabled={isDisabled}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
