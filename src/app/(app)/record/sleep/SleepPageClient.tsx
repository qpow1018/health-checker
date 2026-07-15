"use client";

import { useState } from "react";

import AppHeader from "@/components/common/appHeader/AppHeader";
import BottomNavigation from "@/components/common/bottomNavigation/BottomNavigation";
import Button from "@/components/common/button/Button";
import FormRow from "@/components/common/form/FormRow";
import TextInput from "@/components/common/form/TextInput";

import { MdBedtime } from "react-icons/md";

import styles from "./sleepPageClient.module.scss";

export default function SleepPageClient() {
  const [sleptAt, setSleptAt] = useState("");

  return (
    <main
      className={styles["sleep-page-client"]}
      aria-label="잠든 시간 기록 화면"
    >
      <AppHeader title="잠든 시간" />

      <div className={styles["sleep-page-content"]}>
        <section
          className={styles["hero-section"]}
          aria-labelledby="sleep-page-title"
        >
          <p className={styles.eyebrow}>수면 기록</p>
          <h1 id="sleep-page-title">잠든 시간을 남겨요</h1>
          <p className={styles.description}>
            잠들기 전에 남겨도 되고, 다음 날 기억나는 시간으로 보정해도 됩니다.
          </p>
        </section>

        <section
          className={styles["record-card"]}
          aria-labelledby="slept-at-title"
        >
          <span className={styles["state-icon"]} aria-hidden="true">
            <MdBedtime />
          </span>
          <div className={styles["card-content"]}>
            <h2 id="slept-at-title">언제 잠들었나요?</h2>
            <FormRow label="잠든 시간" htmlFor="slept-at">
              <TextInput
                id="slept-at"
                type="time"
                value={sleptAt}
                onChange={setSleptAt}
              />
            </FormRow>
            <p className={styles["time-preview"]}>
              {sleptAt
                ? `${sleptAt}에 잠든 것으로 기록됩니다.`
                : "아직 입력 전"}
            </p>
            <Button color="primary" size="large" isFullWidth>
              잠든 시간 저장
            </Button>
          </div>
        </section>
      </div>

      <BottomNavigation />
    </main>
  );
}
