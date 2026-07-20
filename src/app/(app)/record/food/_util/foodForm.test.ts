import { describe, expect, test } from "vitest";

import {
  getFoodFormDetails,
  getFoodRecommendationFormItems,
} from "./foodForm";

describe("foodForm", () => {
  test("normalizes food form details", () => {
    expect(
      getFoodFormDetails("  카페  ", [
        { id: 1, name: "  커피  ", amount: "  2잔  " },
        { id: 2, name: "  ", amount: "무시" },
        { id: 3, name: "토스트", amount: "  " },
      ]),
    ).toEqual({
      source: "카페",
      foods: [{ name: "커피", amount: "2잔" }, { name: "토스트" }],
    });
  });

  test("omits an empty source", () => {
    expect(
      getFoodFormDetails("  ", [
        { id: 1, name: "커피", amount: "한 잔" },
      ]),
    ).toEqual({
      foods: [{ name: "커피", amount: "한 잔" }],
    });
  });

  test("converts a recommendation to form items with unique ids", () => {
    expect(
      getFoodRecommendationFormItems({
        id: "recommendation-1",
        source: "카페",
        foods: [{ name: "커피" }, { name: "토스트", amount: "1개" }],
      }),
    ).toEqual([
      { id: 1, name: "커피", amount: "" },
      { id: 2, name: "토스트", amount: "1개" },
    ]);
  });
});
