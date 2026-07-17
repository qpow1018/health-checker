import { AuthGate } from "@/components/auth/AuthGate";

import styles from "./appLayout.module.scss";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGate>
      <div className={styles["app-shell"]}>{children}</div>
    </AuthGate>
  );
}
