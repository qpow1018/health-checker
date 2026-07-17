"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import BottomNavigation from "@/components/common/bottomNavigation/BottomNavigation";
import Button from "@/components/common/button/Button";
import { useHealthRecords } from "@/queries/healthRecordsQuery";

import {
  MdBedtime,
  MdDirectionsRun,
  MdOutlineWc,
  MdRestaurant,
  MdSentimentSatisfiedAlt,
  MdWbSunny,
} from "react-icons/md";

import TodayRecordsDashboard from "./_component/TodayRecordsDashboard";
import {
  formatRecordDashboardDate,
  getRecordDashboardDateRange,
  getRecordDashboardMonthKey,
} from "./_util/recordDashboard";

import styles from "./recordPageClient.module.scss";

const RECORD_ACTIONS = [
  {
    title: "기상 시간",
    Icon: MdWbSunny,
    href: "/record/wake",
  },
  {
    title: "잠든 시간",
    Icon: MdBedtime,
    href: "/record/sleep",
  },
  {
    title: "먹은 음식",
    Icon: MdRestaurant,
    href: "/record/food",
  },
  {
    title: "화장실",
    Icon: MdOutlineWc,
    href: "/record/toilet",
  },
  {
    title: "운동",
    Icon: MdDirectionsRun,
    href: "/record/exercise",
  },
  {
    title: "컨디션",
    Icon: MdSentimentSatisfiedAlt,
    href: "/record/condition",
  },
] as const;

export default function RecordPageClient() {
  const router = useRouter();
  const [today, setToday] = useState(() => new Date());
  const todayRange = getRecordDashboardDateRange(today);
  const monthKey = getRecordDashboardMonthKey(today);
  const { data, isError, isPending } = useHealthRecords(todayRange);

  useEffect(() => {
    let nextDayTimeoutId: number | undefined;

    function scheduleNextDayUpdate() {
      window.clearTimeout(nextDayTimeoutId);

      const currentDate = new Date();
      const nextDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() + 1,
      );

      nextDayTimeoutId = window.setTimeout(
        refreshToday,
        nextDay.getTime() - currentDate.getTime(),
      );
    }

    function refreshToday() {
      const currentDate = new Date();

      setToday((previousDate) =>
        isSameLocalDate(previousDate, currentDate) ? previousDate : currentDate,
      );
      scheduleNextDayUpdate();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        refreshToday();
      }
    }

    scheduleNextDayUpdate();
    window.addEventListener("focus", refreshToday);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearTimeout(nextDayTimeoutId);
      window.removeEventListener("focus", refreshToday);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  function handleClickRecordAction(href: string) {
    router.push(href);
  }

  return (
    <main className={styles["record-page-client"]} aria-label="기록 화면">
      <section className={styles["topbar"]}>
        <div className={styles["title-box"]}>
          <h1 className={styles["title"]}>기록하기</h1>
          <p className={styles["date"]}>{formatRecordDashboardDate(today)}</p>
        </div>
      </section>

      <TodayRecordsDashboard
        isError={isError}
        isLoading={isPending}
        monthKey={monthKey}
        records={data ?? []}
      />

      <section className={styles["action-section"]} aria-label="기록 버튼">
        {RECORD_ACTIONS.map((action) => (
          <Button
            className={styles["record-action-button"]}
            type="button"
            color="primary"
            fill="soft"
            size="large"
            isFullWidth
            key={action.title}
            onClick={() => handleClickRecordAction(action.href)}
          >
            <span className={styles["action-main"]}>
              <span className={styles["action-icon"]}>
                <action.Icon aria-hidden="true" />
              </span>
              <span className={styles["action-label"]}>{action.title}</span>
            </span>
          </Button>
        ))}
      </section>

      <BottomNavigation />
    </main>
  );
}

function isSameLocalDate(leftDate: Date, rightDate: Date) {
  return (
    leftDate.getFullYear() === rightDate.getFullYear() &&
    leftDate.getMonth() === rightDate.getMonth() &&
    leftDate.getDate() === rightDate.getDate()
  );
}
