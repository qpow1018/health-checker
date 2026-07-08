import styles from "./buttonGroup.module.scss";

type TButtonGroupOption<TValue extends string> = {
  value: TValue;
  label: string;
};

type TButtonGroupProps<TValue extends string> = {
  label: string;
  options: ReadonlyArray<TButtonGroupOption<TValue>>;
  value: TValue;
  onChange: (value: TValue) => void;
  isDisabled?: boolean;
};

export function ButtonGroup<TValue extends string>({
  label,
  options,
  value,
  onChange,
  isDisabled = false,
}: TButtonGroupProps<TValue>) {
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
