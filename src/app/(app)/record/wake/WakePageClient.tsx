"use client";

import { useState } from "react";

import AppHeader from "@/components/common/appHeader/AppHeader";
import BottomNavigation from "@/components/common/bottomNavigation/BottomNavigation";
import Button from "@/components/common/button/Button";
import TextInput from "@/components/common/form/TextInput";

import { MdWbSunny } from "react-icons/md";

import styles from "./wakePageClient.module.scss";

export default function WakePageClient() {
  const [wokeAt, setWokeAt] = useState("");

  return (
    <main className={styles["wake-page-client"]} aria-label="기상 시간 기록 화면">
      <AppHeader title="기록" />

      <section className={styles["hero-section"]} aria-labelledby="wake-page-title">
        <p className={styles.eyebrow}>수면 기록</p>
        <h1 id="wake-page-title">기상 시간을 남겨요</h1>
        <p className={styles.description}>
          일어난 뒤 바로 남기거나, 놓친 날은 기억나는 시간으로 보정해도 됩니다.
        </p>
      </section>

      <section className={styles["record-card"]} aria-labelledby="woke-at-title">
        <span className={styles["state-icon"]} aria-hidden="true">
          <MdWbSunny />
        </span>
        <div className={styles["card-content"]}>
          <h2 id="woke-at-title">언제 일어났나요?</h2>
          <TextInput
            id="woke-at"
            label="기상 시간"
            type="time"
            value={wokeAt}
            onChange={setWokeAt}
          />
          <p className={styles["time-preview"]}>
            {wokeAt ? `${wokeAt}에 일어난 것으로 기록됩니다.` : "아직 입력 전"}
          </p>
          <Button color="primary" size="large" isFullWidth>
            기상 시간 저장
          </Button>
        </div>
      </section>

      <BottomNavigation />
    </main>
  );
}
