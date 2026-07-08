import styles from "./tabs.module.scss";

type TTabItem<TValue extends string> = {
  value: TValue;
  label: string;
};

type TTabsProps<TValue extends string> = {
  label: string;
  tabs: ReadonlyArray<TTabItem<TValue>>;
  value: TValue;
  onChange: (value: TValue) => void;
  isDisabled?: boolean;
};

export function Tabs<TValue extends string>({
  label,
  tabs,
  value,
  onChange,
  isDisabled = false,
}: TTabsProps<TValue>) {
  return (
    <div className={styles["tabs"]} role="tablist" aria-label={label}>
      {tabs.map((tab) => {
        const isSelected = tab.value === value;

        return (
          <button
            aria-selected={isSelected}
            className={isSelected ? styles["selected-tab"] : undefined}
            disabled={isDisabled}
            key={tab.value}
            onClick={() => onChange(tab.value)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
