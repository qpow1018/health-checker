"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import BottomNavigation from "@/components/common/bottomNavigation/BottomNavigation";
import Button from "@/components/common/button/Button";

import {
  MdBedtime,
  MdChevronRight,
  MdDirectionsRun,
  MdOutlineCalendarToday,
  MdOutlineWc,
  MdRestaurant,
  MdSentimentSatisfiedAlt,
  MdWbSunny,
} from "react-icons/md";

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
    href: undefined,
  },
  {
    title: "컨디션",
    Icon: MdSentimentSatisfiedAlt,
    href: "/record/condition",
  },
] as const;

export default function RecordPageClient() {
  const router = useRouter();
  const [dateText] = useState("7월 14일 화요일");
  const [sleepSummary] = useState("07:20 기상");
  const [bathroomSummary] = useState("2회");
  const [conditionSummary] = useState("-");

  function handleClickDateButton() {
    // TODO: 날짜 선택 UI를 열고 선택한 날짜로 기록 화면을 갱신한다.
  }

  function handleClickRecordAction(href?: string) {
    if (!href) {
      // TODO: 각 기록 입력 화면이 준비되면 선택한 항목 화면으로 이동한다.
      return;
    }

    router.push(href);
  }

  return (
    <main className={styles["record-page-client"]} aria-label="기록 화면">
      <section className={styles["topbar"]}>
        <div className={styles["title-box"]}>
          <h1 className={styles["title"]}>기록하기</h1>
          <p className={styles["date"]}>{dateText}</p>
        </div>

        <Button
          color="gray"
          fill="outline"
          size="small"
          className={styles["date-action"]}
          onClick={handleClickDateButton}
        >
          <MdOutlineCalendarToday aria-hidden="true" />
          오늘
        </Button>
      </section>

      <section
        className={styles["summary-section"]}
        aria-label="오늘 기록 요약"
      >
        <div className={styles["summary-item"]}>
          <span className={styles["label"]}>수면</span>
          <p className={styles["value"]}>{sleepSummary}</p>
        </div>
        <div className={styles["summary-item"]}>
          <span className={styles["label"]}>화장실</span>
          <p className={styles["value"]}>{bathroomSummary}</p>
        </div>
        <div className={styles["summary-item"]}>
          <span className={styles["label"]}>컨디션</span>
          <p className={styles["value"]}>{conditionSummary}</p>
        </div>
      </section>

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
              <span>{action.title}</span>
            </span>

            <MdChevronRight
              aria-hidden="true"
              className={styles["chevron-icon"]}
            />
          </Button>
        ))}
      </section>

      <BottomNavigation />
    </main>
  );
}
