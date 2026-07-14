"use client";

import {
  MdCheck,
  MdDirectionsRun,
  MdExpandMore,
  MdMonitorHeart,
  MdOutlineCalendarToday,
  MdOutlineWc,
  MdSave,
  MdSentimentSatisfiedAlt,
  MdRestaurant,
} from "react-icons/md";

import { BottomNavigation } from "@/components/common/bottomNavigation/BottomNavigation";
import { Button } from "@/components/common/button/Button";

import styles from "./recordPreviewPageClient.module.scss";

const DAILY_SUMMARY_ITEMS = [
  { label: "수면", value: "07:20 기상" },
  { label: "화장실", value: "2회" },
  { label: "컨디션", value: "기록 전" },
] as const;

const CONDITION_TAGS = ["두통", "피로", "속 불편함"] as const;

export function RecordPreviewPageClient() {
  return (
    <main className={styles["record-preview-page"]} aria-label="기록 화면 시안">
      <div className={styles["app-canvas"]}>
        <header className={styles["topbar"]}>
          <div className={styles["topbar-title"]}>
            <p className={styles["eyebrow"]}>오늘 기록</p>
            <h1>하루 흐름을 남겨요</h1>
            <p className={styles["topbar-description"]}>
              7월 14일 화요일
            </p>
          </div>

          <button className={styles["date-button"]} type="button">
            <MdOutlineCalendarToday aria-hidden="true" />
            오늘
          </button>
        </header>

        <section className={styles["summary-grid"]} aria-label="오늘 기록 요약">
          {DAILY_SUMMARY_ITEMS.map((item) => (
            <div className={styles["summary-item"]} key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </section>

        <section className={styles["section-list"]} aria-label="기록 입력 항목">
          <RecordPreviewSection
            title="수면 관련"
            description="취침, 기상, 수면 만족도"
            status="입력됨"
            Icon={MdSentimentSatisfiedAlt}
            isDone
          />

          <RecordPreviewSection
            title="음식 관련"
            description="식사, 커피, 영양제, 음주"
            status="추가"
            Icon={MdRestaurant}
          />

          <RecordPreviewSection
            title="운동 관련"
            description="운동 여부, 종류, 강도"
            status="추가"
            Icon={MdDirectionsRun}
          />

          <RecordPreviewSection
            title="화장실 관련"
            description="소변, 대변, 복부 불편감"
            status="2회"
            Icon={MdOutlineWc}
            isDone
          />

          <details className={styles["condition-details"]}>
            <summary>
              <span className={styles["entry-icon"]}>
                <MdMonitorHeart aria-hidden="true" />
              </span>
              <span className={styles["condition-title"]}>
                <strong>컨디션 관련</strong>
                <span>두통, 피로, 몸상태는 이상 있을 때만</span>
              </span>
              <MdExpandMore aria-hidden="true" className={styles["expand-icon"]} />
            </summary>

            <div className={styles["condition-body"]}>
              <div className={styles["tag-row"]} aria-label="컨디션 증상 선택">
                {CONDITION_TAGS.map((tag) => (
                  <button className={styles["tag-button"]} type="button" key={tag}>
                    {tag}
                  </button>
                ))}
              </div>

              <label className={styles["memo-field"]}>
                <span>메모</span>
                <textarea placeholder="예: 오후부터 관자놀이가 아팠음" />
              </label>
            </div>
          </details>
        </section>

        <div className={styles["save-action"]}>
          <Button color="primary" size="large" isFullWidth>
            <MdSave aria-hidden="true" />
            오늘 기록 저장
          </Button>
        </div>

        <BottomNavigation />
      </div>
    </main>
  );
}

function RecordPreviewSection(props: {
  title: string;
  description: string;
  status: string;
  Icon: typeof MdSentimentSatisfiedAlt;
  isDone?: boolean;
}) {
  const { title, description, status, Icon, isDone = false } = props;

  return (
    <button
      className={`${styles["section-button"]} ${
        isDone ? styles["section-button-done"] : ""
      }`}
      type="button"
    >
      <span className={styles["entry-icon"]}>
        <Icon aria-hidden="true" />
      </span>
      <span className={styles["section-copy"]}>
        <strong>{title}</strong>
        <span>{description}</span>
      </span>
      <span className={styles["section-status"]}>
        {status}
        {isDone && <MdCheck aria-hidden="true" />}
      </span>
    </button>
  );
}
