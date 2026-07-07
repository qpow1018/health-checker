import type {
  TBathroomLogKind,
  TStoolState,
  TUrgency,
} from "@/app/(app)/record/_type/bathroomLog";

export const RECORD_KIND_LABEL: Record<TBathroomLogKind, string> = {
  urine: "소변",
  bowel: "대변",
  both: "둘 다",
};

export const RECORD_KIND_OPTIONS: Array<{
  kind: TBathroomLogKind;
  label: string;
  description: string;
}> = [
  {
    kind: "urine",
    label: "소변",
    description: "지금 시각으로 소변 기록",
  },
  {
    kind: "bowel",
    label: "대변",
    description: "지금 시각으로 대변 기록",
  },
  {
    kind: "both",
    label: "둘 다",
    description: "소변과 대변을 함께 기록",
  },
];

export const URGENCY_OPTIONS: Array<{ value: TUrgency; label: string }> = [
  { value: "relaxed", label: "여유" },
  { value: "ordinary", label: "보통" },
  { value: "urgent", label: "급함" },
];

export const STOOL_STATE_OPTIONS: Array<{ value: TStoolState; label: string }> = [
  { value: "usual", label: "평소와 비슷함" },
  { value: "loose", label: "묽음" },
  { value: "hard", label: "딱딱함" },
];
