import type { TReqUpdateBathroomLogDetails } from "@/api/bathroomLogs/type";
import type {
  TBathroomLogKind,
  TRecordDetailFormState,
} from "@/app/(app)/record/_type/bathroomLog";

export function createEmptyDetailForm(): TRecordDetailFormState {
  return {
    urgency: "",
    wokeFromSleep: "",
    note: "",
    urinePain: false,
    urineColorUnusual: false,
    stoolState: "",
    bowelPain: false,
    possibleBlood: false,
  };
}

export function toBathroomLogDetailUpdate(
  kind: TBathroomLogKind,
  form: TRecordDetailFormState,
): TReqUpdateBathroomLogDetails {
  const hasUrineFields = kind === "urine" || kind === "both";
  const hasBowelFields = kind === "bowel" || kind === "both";
  const note = form.note.trim();

  return {
    urgency: form.urgency || null,
    woke_from_sleep: toNullableBoolean(form.wokeFromSleep),
    note: note || null,
    urine_pain: hasUrineFields ? form.urinePain : null,
    urine_color_unusual: hasUrineFields ? form.urineColorUnusual : null,
    stool_state: hasBowelFields ? form.stoolState || null : null,
    bowel_pain: hasBowelFields ? form.bowelPain : null,
    possible_blood: hasBowelFields ? form.possibleBlood : null,
  };
}

function toNullableBoolean(value: TRecordDetailFormState["wokeFromSleep"]) {
  if (value === "yes") {
    return true;
  }

  if (value === "no") {
    return false;
  }

  return null;
}
