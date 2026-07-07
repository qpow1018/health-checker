import Link from "next/link";

import styles from "./appBottomTabs.module.scss";

type TAppBottomTabHref = "/record" | "/records" | "/report" | "/settings";

type TAppBottomTabsProps = {
  activeHref: TAppBottomTabHref;
};

const APP_BOTTOM_TABS: Array<{ href: TAppBottomTabHref; label: string }> = [
  { href: "/record", label: "기록" },
  { href: "/records", label: "기록 보기" },
  { href: "/report", label: "AI 리포트" },
  { href: "/settings", label: "설정" },
];

export function AppBottomTabs({ activeHref }: TAppBottomTabsProps) {
  return (
    <nav className={styles["bottom-tabs"]} aria-label="하단 탭">
      {APP_BOTTOM_TABS.map((tab) => (
        <Link
          className={tab.href === activeHref ? styles["active-tab"] : undefined}
          href={tab.href}
          key={tab.href}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
