import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import QueryProvider from "@/components/QueryProvider";

import FoodPageClient from "./FoodPageClient";

const back = vi.fn();
const healthRecordMocks = vi.hoisted(() => ({
  createFoodRecord: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/record/food",
  useRouter: () => ({
    back,
  }),
}));

vi.mock("@/api/healthRecords", () => ({
  createFoodRecord: healthRecordMocks.createFoodRecord,
}));

describe("FoodPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("shows the food record form", () => {
    render(<QueryProvider><FoodPageClient /></QueryProvider>);

    expect(screen.getByRole("main", { name: "음식 기록 화면" })).toBeInTheDocument();
    expect(screen.getByLabelText("날짜")).toBeInTheDocument();
    expect(screen.getByLabelText("시간")).toBeInTheDocument();
    expect(screen.getByLabelText("음식 이름")).toBeInTheDocument();
    expect(screen.getByLabelText("양")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "저장" })).toBeDisabled();
  });

  test("adds and removes a food input", async () => {
    const user = userEvent.setup();
    render(<QueryProvider><FoodPageClient /></QueryProvider>);

    await user.click(screen.getByRole("button", { name: "음식 추가" }));

    expect(screen.getAllByLabelText("음식 이름")).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "음식 삭제" })).toHaveLength(2);

    await user.click(screen.getAllByRole("button", { name: "음식 삭제" })[1]);

    expect(screen.getAllByLabelText("음식 이름")).toHaveLength(1);
  });

  test("saves the entered food items", async () => {
    const user = userEvent.setup();
    healthRecordMocks.createFoodRecord.mockResolvedValue({ id: "record-4" });
    render(<QueryProvider><FoodPageClient /></QueryProvider>);

    await selectTime(user);
    await user.type(screen.getByLabelText("음식 이름"), "커피");
    await user.type(screen.getByLabelText("양"), "2잔");
    await user.click(screen.getByRole("button", { name: "음식 추가" }));
    await user.type(screen.getAllByLabelText("음식 이름")[1], "토스트");
    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(healthRecordMocks.createFoodRecord).toHaveBeenCalledWith({
      date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      time: "08:30",
      foods: [
        { name: "커피", amount: "2잔" },
        { name: "토스트", amount: "" },
      ],
    });
    expect(back).toHaveBeenCalled();
  });

  test("shows an error when saving fails", async () => {
    const user = userEvent.setup();
    healthRecordMocks.createFoodRecord.mockRejectedValue(new Error("save failed"));
    render(<QueryProvider><FoodPageClient /></QueryProvider>);

    await selectTime(user);
    await user.type(screen.getByLabelText("음식 이름"), "커피");
    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(
      await screen.findByText("음식 기록을 저장하지 못했습니다. 다시 시도해 주세요."),
    ).toBeInTheDocument();
  });
});

async function selectTime(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByLabelText("시간"));
  await user.click(screen.getAllByRole("option", { name: "08" })[0]);
  await user.click(screen.getAllByRole("option", { name: "30" })[0]);
  await user.click(screen.getByRole("button", { name: "적용하기" }));
}
