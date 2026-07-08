import Link from "next/link";

import styles from "./bottomNavigation.module.scss";

type TBottomNavigationHref = "/record" | "/records" | "/report" | "/settings";

type TBottomNavigationProps = {
  activeHref: TBottomNavigationHref;
};

const BOTTOM_NAVIGATION_ITEMS: Array<{ href: TBottomNavigationHref; label: string }> = [
  { href: "/record", label: "기록" },
  { href: "/records", label: "기록 보기" },
  { href: "/report", label: "AI 리포트" },
  { href: "/settings", label: "설정" },
];

export function BottomNavigation({ activeHref }: TBottomNavigationProps) {
  return (
    <nav className={styles["bottom-navigation"]} aria-label="하단 탭">
      {BOTTOM_NAVIGATION_ITEMS.map((tab) => (
        <Link
          className={tab.href === activeHref ? styles["active-item"] : undefined}
          href={tab.href}
          key={tab.href}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
