import type { ReactNode } from "react";

import styles from "./formMessage.module.scss";

type TFormMessageType = "default" | "error";

export default function FormMessage(props: {
  type?: TFormMessageType;
  children: ReactNode;
}) {
  const { type = "default", children } = props;

  return (
    <p className={[styles["form-message"], styles[`type-${type}`]].join(" ")}>
      {children}
    </p>
  );
}
