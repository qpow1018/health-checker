import type { ReactNode } from "react";

import styles from "./formRow.module.scss";

export default function FormRow(props: {
  label: string;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}) {
  const { label, htmlFor, className, children } = props;
  const rowClassName = [styles["form-row"], className].filter(Boolean).join(" ");

  return (
    <div className={rowClassName}>
      {htmlFor ? (
        <label className={styles["form-row-label"]} htmlFor={htmlFor}>
          {label}
        </label>
      ) : (
        <div className={styles["form-row-label"]}>{label}</div>
      )}
      <div className={styles["form-row-control"]}>{children}</div>
    </div>
  );
}
