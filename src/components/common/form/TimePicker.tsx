"use client";

import { useRef, useState } from "react";

import BottomModal from "@/components/common/bottomModal/BottomModal";
import Button from "@/components/common/button/Button";
import WheelPicker from "@/components/common/form/WheelPicker";

import { MdOutlineAccessTime } from "react-icons/md";

import styles from "./timePicker.module.scss";

const HOURS = Array.from({ length: 24 }, (_, index) => ({
  value: String(index).padStart(2, "0"),
  label: String(index).padStart(2, "0"),
}));
const MINUTES = Array.from({ length: 12 }, (_, index) => {
  const value = String(index * 5).padStart(2, "0");

  return { value, label: value };
});

type TTimeValue = {
  hour: string;
  minute: string;
};

export default function TimePicker(props: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
}) {
  const { id, value, onChange, isDisabled = false } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [draftTime, setDraftTime] = useState(() => parseTimeValue(value));
  const hourWheelRef = useRef<HTMLDivElement>(null);

  function handleOpen() {
    setDraftTime(parseTimeValue(value));
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
  }

  function handleHourChange(hour: string) {
    setDraftTime((previousTime) => ({
      hour,
      minute: previousTime?.minute ?? "00",
    }));
  }

  function handleMinuteChange(minute: string) {
    setDraftTime((previousTime) => ({
      hour: previousTime?.hour ?? "00",
      minute,
    }));
  }

  function handleApply() {
    if (!draftTime) {
      return;
    }

    onChange(formatTimeValue(draftTime));
    handleClose();
  }

  return (
    <>
      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={styles["time-picker"]}
        disabled={isDisabled}
        id={id}
        onClick={handleOpen}
        type="button"
      >
        <span>{value || "시간 선택"}</span>
        <MdOutlineAccessTime aria-hidden="true" />
      </button>

      <BottomModal
        initialFocusRef={hourWheelRef}
        isOpen={isOpen}
        onClose={handleClose}
        title="시간 선택"
      >
        <div className={styles["time-picker-modal"]}>
          <div className={styles["time-picker-wheels"]}>
            <div className={styles["time-picker-wheel"]}>
              <h3>시</h3>
              <WheelPicker
                ariaLabel="시 선택"
                focusRef={hourWheelRef}
                isInfinite
                onChange={handleHourChange}
                options={HOURS}
                value={draftTime?.hour ?? "00"}
              />
            </div>
            <div className={styles["time-picker-wheel"]}>
              <h3>분</h3>
              <WheelPicker
                ariaLabel="분 선택"
                isInfinite
                onChange={handleMinuteChange}
                options={MINUTES}
                value={draftTime?.minute ?? "00"}
              />
            </div>
          </div>

          <div className={styles["time-picker-actions"]}>
            <Button
              color="gray"
              fill="outline"
              isFullWidth
              onClick={handleClose}
              size="large"
            >
              취소
            </Button>
            <Button
              color="primary"
              isDisabled={!draftTime}
              isFullWidth
              onClick={handleApply}
              size="large"
            >
              적용하기
            </Button>
          </div>
        </div>
      </BottomModal>
    </>
  );
}

function parseTimeValue(value: string): TTimeValue | undefined {
  const [hour, minute] = value.split(":");
  const parsedHour = Number(hour);
  const parsedMinute = Number(minute);

  if (
    !Number.isInteger(parsedHour) ||
    !Number.isInteger(parsedMinute) ||
    parsedHour < 0 ||
    parsedHour > 23 ||
    parsedMinute < 0 ||
    parsedMinute > 59
  ) {
    return undefined;
  }

  return {
    hour: hour.padStart(2, "0"),
    minute: minute.padStart(2, "0"),
  };
}

function formatTimeValue(time: TTimeValue) {
  return `${time.hour}:${time.minute}`;
}
