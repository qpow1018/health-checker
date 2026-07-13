import styles from "./tabs.module.scss";

type TTabItem<TValue extends string> = {
  value: TValue;
  label: string;
};

export function Tabs(props: {
  label: string;
  tabs: ReadonlyArray<TTabItem<string>>;
  value: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
  idPrefix?: string;
}) {
  const { label, tabs, value, onChange, isDisabled = false, idPrefix } = props;

  return (
    <div className={styles["tabs"]} role="tablist" aria-label={label}>
      {tabs.map((tab) => {
        const isSelected = tab.value === value;

        return (
          <button
            aria-controls={
              idPrefix ? `${idPrefix}-${tab.value}-panel` : undefined
            }
            aria-selected={isSelected}
            className={isSelected ? styles["selected-tab"] : undefined}
            disabled={isDisabled}
            id={idPrefix ? `${idPrefix}-${tab.value}-tab` : undefined}
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
