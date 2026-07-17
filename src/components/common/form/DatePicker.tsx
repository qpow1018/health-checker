"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";

import { formatDateString } from "@/utils/date";
import { ko } from "react-day-picker/locale";

import "react-day-picker/style.css";

import BottomModal from "@/components/common/bottomModal/BottomModal";
import Button from "@/components/common/button/Button";

import { MdOutlineCalendarToday } from "react-icons/md";

import styles from "./datePicker.module.scss";

export default function DatePicker(props: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  isDisabled?: boolean;
}) {
  const { id, value, onChange, min, max, isDisabled = false } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [draftDate, setDraftDate] = useState(() => parseDateValue(value));
  const selectedDate = parseDateValue(value);
  const disabledDates = getDisabledDates(min, max);

  function handleOpen() {
    setDraftDate(selectedDate);
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
  }

  function handleApply() {
    if (!draftDate) {
      return;
    }

    onChange(formatDateString(draftDate));
    handleClose();
  }

  return (
    <>
      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={styles["date-picker"]}
        disabled={isDisabled}
        id={id}
        onClick={handleOpen}
        type="button"
      >
        <span>{value ? formatDateLabel(value) : "날짜 선택"}</span>
        <MdOutlineCalendarToday aria-hidden="true" />
      </button>

      <BottomModal isOpen={isOpen} onClose={handleClose} title="날짜 선택">
        <div className={styles["date-picker-modal"]}>
          <DayPicker
            className={styles["date-picker-calendar"]}
            defaultMonth={draftDate}
            disabled={disabledDates}
            locale={ko}
            mode="single"
            navLayout="around"
            onSelect={setDraftDate}
            selected={draftDate}
          />

          <div className={styles["date-picker-actions"]}>
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
              isDisabled={!draftDate}
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

function formatDateLabel(value: string) {
  const date = parseDateValue(value);

  if (!date) {
    return value;
  }

  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function parseDateValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  return new Date(year, month - 1, day);
}

function getDisabledDates(min?: string, max?: string) {
  const minDate = min ? parseDateValue(min) : undefined;
  const maxDate = max ? parseDateValue(max) : undefined;
  const disabledDates: Array<{ before: Date } | { after: Date }> = [];

  if (minDate) {
    disabledDates.push({ before: minDate });
  }

  if (maxDate) {
    disabledDates.push({ after: maxDate });
  }

  return disabledDates;
}
