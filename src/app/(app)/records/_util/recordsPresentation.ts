import type { TReqUpdateBathroomLogDetails } from "@/api/bathroomLogs/type";
import type {
  TBathroomLogKind,
  TRecordDetailFormState,
} from "@/app/(app)/record/_type/bathroomLog";
import { createBathroomLogDetailUpdateRequest } from "@/app/(app)/record/_util/recordDetailForm";
import type { TBathroomLogRow } from "@/api/bathroomLogs/type";

const DATE_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  month: "numeric",
  day: "numeric",
  weekday: "long",
  timeZone: "Asia/Seoul",
});

const TIME_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Seoul",
});

export function formatRecordDateLabel(loggedAt: string) {
  const parts = DATE_FORMATTER.formatToParts(new Date(loggedAt));
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  const weekday = parts.find((part) => part.type === "weekday")?.value;

  return `${month}월 ${day}일 ${weekday}`;
}

export function formatRecordTimeLabel(loggedAt: string) {
  return TIME_FORMATTER.format(new Date(loggedAt));
}

export function createRecordDetailFormFromLog(
  log: TBathroomLogRow,
): TRecordDetailFormState {
  return {
    urgency: log.urgency ?? "",
    wokeFromSleep: createWokeFromSleepFormValue(log.woke_from_sleep),
    note: log.note ?? "",
    urinePain: log.urine_pain ?? false,
    urineColorUnusual: log.urine_color_unusual ?? false,
    stoolState: log.stool_state ?? "",
    bowelPain: log.bowel_pain ?? false,
    possibleBlood: log.possible_blood ?? false,
  };
}

export function createRecordUpdateRequest(
  kind: TBathroomLogKind,
  form: TRecordDetailFormState,
): TReqUpdateBathroomLogDetails {
  return createBathroomLogDetailUpdateRequest(kind, form);
}

export function hasRecordDetails(log: TBathroomLogRow) {
  return Boolean(
    log.urgency ||
      log.woke_from_sleep !== null ||
      log.note ||
      log.urine_pain !== null ||
      log.urine_color_unusual !== null ||
      log.stool_state ||
      log.bowel_pain !== null ||
      log.possible_blood !== null,
  );
}

function createWokeFromSleepFormValue(value: boolean | null) {
  if (value === true) {
    return "yes";
  }

  if (value === false) {
    return "no";
  }

  return "";
}
