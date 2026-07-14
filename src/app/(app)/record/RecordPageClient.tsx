"use client";

import { useState } from "react";

import { BottomNavigation } from "@/components/common/bottomNavigation/BottomNavigation";
import { Button } from "@/components/common/button/Button";

import {
  MdAdd,
  MdOutlineCalendarToday,
  MdOutlineWc,
  MdRestaurant,
  MdSentimentSatisfiedAlt,
} from "react-icons/md";

import styles from "./recordPageClient.module.scss";

const SUMMARY_ITEMS = [
  { key: "sleep", label: "수면" },
  { key: "bathroom", label: "화장실" },
  { key: "condition", label: "컨디션" },
] as const;

type TSummaryValues = Record<(typeof SUMMARY_ITEMS)[number]["key"], string>;

const RECORD_ACTIONS = [
  {
    title: "화장실 기록",
    description: "소변, 대변, 복부 불편감",
    Icon: MdOutlineWc,
  },
  {
    title: "음식 기록",
    description: "식사, 커피, 영양제, 음주",
    Icon: MdRestaurant,
  },
  {
    title: "컨디션 기록",
    description: "두통, 피로, 몸상태 메모",
    Icon: MdSentimentSatisfiedAlt,
  },
] as const;

export default function RecordPageClient() {
  // TODO
  const [dateText] = useState("7월 14일 화요일");
  const [summaryValues] = useState<TSummaryValues>({
    sleep: "07:20 기상",
    bathroom: "2회",
    condition: "-",
  });

  function handleClickDateButton() {
    // TODO: 날짜 선택 UI를 열고 선택한 날짜로 기록 화면을 갱신한다.
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

      <section className={styles["summary-section"]} aria-label="오늘 기록 요약">
        {SUMMARY_ITEMS.map((item) => (
          <div className={styles["summary-item"]} key={item.key}>
            <span className={styles["label"]}>{item.label}</span>
            <p className={styles["value"]}>{summaryValues[item.key]}</p>
          </div>
        ))}
      </section>

      <section className={styles["action-section"]} aria-label="기록 버튼">
        <div className={styles["section-heading"]}>
          <h2>기록하기</h2>
          <p>필요한 항목만 골라 빠르게 남기는 구조입니다.</p>
        </div>

        <div className={styles["action-list"]}>
          {RECORD_ACTIONS.map((action) => (
            <button
              className={styles["record-action-button"]}
              type="button"
              key={action.title}
            >
              <span className={styles["entry-icon"]}>
                <action.Icon aria-hidden="true" />
              </span>
              <span className={styles["action-copy"]}>
                <strong>{action.title}</strong>
                <span>{action.description}</span>
              </span>
              <span className={styles["add-icon"]}>
                <MdAdd aria-hidden="true" />
              </span>
            </button>
          ))}
        </div>

        <div className={styles["primary-action"]}>
          <Button color="primary" size="large" isFullWidth>
            <MdAdd aria-hidden="true" />새 기록 시작
          </Button>
        </div>
      </section>

      <BottomNavigation />
    </main>
  );
}
