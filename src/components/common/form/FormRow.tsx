import type { ReactNode } from "react";

import styles from "./formRow.module.scss";

export default function FormRow(props: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const { label, className, children } = props;
  const rowClassName = [styles["form-row"], className].filter(Boolean).join(" ");

  return (
    <div className={rowClassName}>
      <div className={styles["form-row-label"]}>{label}</div>
      <div className={styles["form-row-control"]}>{children}</div>
    </div>
  );
}
