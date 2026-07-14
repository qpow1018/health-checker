"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { IconType } from "react-icons";
import { MdAutoAwesome, MdEditNote, MdOutlineHistory, MdSettings } from "react-icons/md";

import styles from "./bottomNavigation.module.scss";

type TBottomNavigationHref = "/record" | "/records" | "/report" | "/settings";

const BOTTOM_NAVIGATION_ITEMS: ReadonlyArray<{
  href: TBottomNavigationHref;
  label: string;
  Icon: IconType;
}> = [
  { href: "/record", label: "기록", Icon: MdEditNote },
  { href: "/records", label: "기록 보기", Icon: MdOutlineHistory },
  { href: "/report", label: "AI 리포트", Icon: MdAutoAwesome },
  { href: "/settings", label: "설정", Icon: MdSettings },
];

export default function BottomNavigation() {
  const pathname = usePathname() ?? "";

  return (
    <nav className={styles["bottom-navigation"]} aria-label="하단 탭">
      {BOTTOM_NAVIGATION_ITEMS.map((item) => {
        const isActive = isActiveNavigationItem(pathname, item.href);
        const itemClassName = [
          styles["bottom-navigation-item"],
          isActive ? styles["active-navigation-item"] : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={itemClassName}
            href={item.href}
            key={item.href}
          >
            <span className={styles["bottom-navigation-icon-wrap"]}>
              <item.Icon
                aria-hidden="true"
                className={styles["bottom-navigation-icon"]}
                focusable="false"
              />
            </span>
            <span className={styles["bottom-navigation-label"]}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function isActiveNavigationItem(pathname: string, href: TBottomNavigationHref) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
