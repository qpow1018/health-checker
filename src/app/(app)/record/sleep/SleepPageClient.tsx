"use client";

import { useState } from "react";

import AppHeader from "@/components/common/appHeader/AppHeader";
import BottomNavigation from "@/components/common/bottomNavigation/BottomNavigation";
import Button from "@/components/common/button/Button";
import DatePicker from "@/components/common/form/DatePicker";
import FormRow from "@/components/common/form/FormRow";
import TimePicker from "@/components/common/form/TimePicker";

import styles from "./sleepPageClient.module.scss";

export default function SleepPageClient() {
  const [sleptOn, setSleptOn] = useState(getToday);
  const [sleptAt, setSleptAt] = useState("");

  return (
    <main
      className={styles["sleep-page-client"]}
      aria-label="잠든 시간 기록 화면"
    >
      <AppHeader title="잠든 시간" />

      <div className={styles["sleep-page-content"]}>
        <form
          className={styles["sleep-form"]}
          onSubmit={(event) => event.preventDefault()}
        >
          <FormRow label="날짜" htmlFor="slept-on">
            <DatePicker id="slept-on" onChange={setSleptOn} value={sleptOn} />
          </FormRow>
          <FormRow label="시간" htmlFor="slept-at">
            <TimePicker id="slept-at" onChange={setSleptAt} value={sleptAt} />
          </FormRow>

          <Button
            color="primary"
            isDisabled={!sleptOn || !sleptAt}
            isFullWidth
            size="large"
            type="submit"
          >
            저장
          </Button>
        </form>
      </div>

      <BottomNavigation />
    </main>
  );
}

function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
