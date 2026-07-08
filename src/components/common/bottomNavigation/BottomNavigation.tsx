import Link from "next/link";
import type { IconType } from "react-icons";
import { MdAutoAwesome, MdEditNote, MdOutlineHistory, MdSettings } from "react-icons/md";

import styles from "./bottomNavigation.module.scss";

type TBottomNavigationHref = "/record" | "/records" | "/report" | "/settings";

type TBottomNavigationProps = {
  activeHref: TBottomNavigationHref;
};

const BOTTOM_NAVIGATION_ITEMS: Array<{
  href: TBottomNavigationHref;
  label: string;
  Icon: IconType;
}> = [
  { href: "/record", label: "기록", Icon: MdEditNote },
  { href: "/records", label: "기록 보기", Icon: MdOutlineHistory },
  { href: "/report", label: "AI 리포트", Icon: MdAutoAwesome },
  { href: "/settings", label: "설정", Icon: MdSettings },
];

export function BottomNavigation({ activeHref }: TBottomNavigationProps) {
  return (
    <nav className={styles["bottom-navigation"]} aria-label="하단 탭">
      {BOTTOM_NAVIGATION_ITEMS.map((tab) => {
        const isActive = tab.href === activeHref;

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={[styles["navigation-item"], isActive ? styles["active-item"] : ""]
              .filter(Boolean)
              .join(" ")}
            href={tab.href}
            key={tab.href}
          >
            <span className={styles["icon-wrap"]}>
              <tab.Icon aria-hidden="true" className={styles["icon"]} focusable="false" />
            </span>
            <span className={styles["label"]}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
