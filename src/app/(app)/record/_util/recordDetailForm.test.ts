import { describe, expect, test } from "vitest";
import {
  createBathroomLogDetailUpdateRequest,
  createEmptyDetailForm,
} from "./recordDetailForm";

describe("recordDetailForm", () => {
  test("creates an empty detail form", () => {
    expect(createEmptyDetailForm()).toEqual({
      urgency: "",
      wokeFromSleep: "",
      note: "",
      urinePain: false,
      urineColorUnusual: false,
      stoolState: "",
      bowelPain: false,
      possibleBlood: false,
    });
  });

  test("maps urine details and clears bowel-only fields", () => {
    expect(
      createBathroomLogDetailUpdateRequest("urine", {
        urgency: "urgent",
        wokeFromSleep: "no",
        note: "  저녁 이후  ",
        urinePain: true,
        urineColorUnusual: false,
        stoolState: "loose",
        bowelPain: true,
        possibleBlood: true,
      }),
    ).toEqual({
      urgency: "urgent",
      woke_from_sleep: false,
      note: "저녁 이후",
      urine_pain: true,
      urine_color_unusual: false,
      stool_state: null,
      bowel_pain: null,
      possible_blood: null,
    });
  });

  test("maps bowel details and clears urine-only fields", () => {
    expect(
      createBathroomLogDetailUpdateRequest("bowel", {
        urgency: "",
        wokeFromSleep: "yes",
        note: "",
        urinePain: true,
        urineColorUnusual: true,
        stoolState: "hard",
        bowelPain: false,
        possibleBlood: true,
      }),
    ).toEqual({
      urgency: null,
      woke_from_sleep: true,
      note: null,
      urine_pain: null,
      urine_color_unusual: null,
      stool_state: "hard",
      bowel_pain: false,
      possible_blood: true,
    });
  });

  test("keeps urine and bowel fields for both kind", () => {
    expect(
      createBathroomLogDetailUpdateRequest("both", {
        urgency: "ordinary",
        wokeFromSleep: "",
        note: "메모",
        urinePain: false,
        urineColorUnusual: true,
        stoolState: "usual",
        bowelPain: true,
        possibleBlood: false,
      }),
    ).toEqual({
      urgency: "ordinary",
      woke_from_sleep: null,
      note: "메모",
      urine_pain: false,
      urine_color_unusual: true,
      stool_state: "usual",
      bowel_pain: true,
      possible_blood: false,
    });
  });
});
