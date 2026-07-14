"use client";

import { useMemo, useState } from "react";

import AppHeader from "@/components/common/appHeader/AppHeader";
import BottomNavigation from "@/components/common/bottomNavigation/BottomNavigation";
import Button from "@/components/common/button/Button";
import TextInput from "@/components/common/form/TextInput";

import { MdBedtime, MdCheckCircle, MdWbSunny } from "react-icons/md";

import styles from "./sleepPageClient.module.scss";

type TSleepRecordState = "ready" | "sleeping" | "completed";

export default function SleepPageClient() {
  const [recordState, setRecordState] = useState<TSleepRecordState>("ready");
  const [sleptAt, setSleptAt] = useState("23:30");
  const [wokeAt, setWokeAt] = useState("07:20");
  const sleepDuration = useMemo(
    () => formatSleepDuration(sleptAt, wokeAt),
    [sleptAt, wokeAt],
  );

  return (
    <main className={styles["sleep-page-client"]} aria-label="수면 시간 기록 화면">
      <AppHeader title="기록" />

      <section className={styles["hero-section"]} aria-labelledby="sleep-page-title">
        <p className={styles.eyebrow}>수면 시간</p>
        <h1 id="sleep-page-title">{getSleepTitle(recordState)}</h1>
        <p className={styles.description}>{getSleepDescription(recordState)}</p>
      </section>

      {recordState === "ready" && (
        <section className={styles["record-card"]} aria-labelledby="sleep-start-title">
          <span className={styles["state-icon"]} aria-hidden="true">
            <MdBedtime />
          </span>
          <div className={styles["card-content"]}>
            <h2 id="sleep-start-title">잠들기 전에 남겨요</h2>
            <TextInput
              id="slept-at"
              label="잠들 시간"
              type="time"
              value={sleptAt}
              onChange={setSleptAt}
            />
            <Button color="primary" size="large" isFullWidth onClick={() => setRecordState("sleeping")}>
              잠들기
            </Button>
          </div>
        </section>
      )}

      {recordState === "sleeping" && (
        <section className={styles["record-card"]} aria-labelledby="wake-record-title">
          <span className={styles["state-icon"]} aria-hidden="true">
            <MdWbSunny />
          </span>
          <div className={styles["card-content"]}>
            <h2 id="wake-record-title">{sleptAt}에 잠들었어요</h2>
            <TextInput
              id="woke-at"
              label="일어난 시간"
              type="time"
              value={wokeAt}
              onChange={setWokeAt}
            />
            <p className={styles["duration-preview"]}>예상 수면 시간 {sleepDuration}</p>
            <div className={styles["feeling-options"]} role="group" aria-label="기상 후 느낌">
              <Button color="gray" fill="outline" size="small">
                가벼움
              </Button>
              <Button color="primary" fill="soft" size="small">
                보통
              </Button>
              <Button color="gray" fill="outline" size="small">
                무거움
              </Button>
            </div>
            <Button color="primary" size="large" isFullWidth onClick={() => setRecordState("completed")}>
              일어났어요
            </Button>
          </div>
        </section>
      )}

      {recordState === "completed" && (
        <section className={styles["record-card"]} aria-labelledby="sleep-complete-title">
          <span className={styles["state-icon"]} aria-hidden="true">
            <MdCheckCircle />
          </span>
          <div className={styles["card-content"]}>
            <h2 id="sleep-complete-title">수면 기록을 남겼어요</h2>
            <dl className={styles["summary-list"]}>
              <div>
                <dt>잠든 시간</dt>
                <dd>{sleptAt}</dd>
              </div>
              <div>
                <dt>일어난 시간</dt>
                <dd>{wokeAt}</dd>
              </div>
              <div>
                <dt>수면 시간</dt>
                <dd>{sleepDuration}</dd>
              </div>
            </dl>
            <Button color="gray" fill="outline" size="large" isFullWidth onClick={() => setRecordState("ready")}>
              다시 기록하기
            </Button>
          </div>
        </section>
      )}

      <BottomNavigation />
    </main>
  );
}

function getSleepTitle(recordState: TSleepRecordState) {
  if (recordState === "sleeping") {
    return "일어났다면 기록을 마무리해요";
  }

  if (recordState === "completed") {
    return "오늘 수면을 확인해요";
  }

  return "잠들기 전에 시작해요";
}

function getSleepDescription(recordState: TSleepRecordState) {
  if (recordState === "sleeping") {
    return "기상한 뒤 일어난 시간을 남기면 수면 시간이 계산됩니다.";
  }

  if (recordState === "completed") {
    return "저장 연동 전 미리 보는 완료 화면입니다.";
  }

  return "잠들기 직전에 시작 시간을 남겨두고, 아침에 이어서 기록합니다.";
}

function formatSleepDuration(sleptAt: string, wokeAt: string) {
  const sleptMinutes = parseTimeToMinutes(sleptAt);
  const wokeMinutes = parseTimeToMinutes(wokeAt);

  if (sleptMinutes === null || wokeMinutes === null) {
    return "-";
  }

  const durationMinutes =
    wokeMinutes > sleptMinutes
      ? wokeMinutes - sleptMinutes
      : wokeMinutes + 24 * 60 - sleptMinutes;
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (minutes === 0) {
    return `${hours}시간`;
  }

  return `${hours}시간 ${minutes}분`;
}

function parseTimeToMinutes(timeText: string) {
  const [hourText, minuteText] = timeText.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return hour * 60 + minute;
}
