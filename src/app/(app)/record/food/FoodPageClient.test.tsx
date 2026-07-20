import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import QueryProvider from "@/components/QueryProvider";

import FoodPageClient from "./FoodPageClient";

const routerMocks = vi.hoisted(() => ({
  back: vi.fn(),
  editId: "",
}));
const healthRecordMocks = vi.hoisted(() => ({
  createFoodRecord: vi.fn(),
  getHealthRecord: vi.fn(),
  updateHealthRecord: vi.fn(),
}));
const foodRecommendationMocks = vi.hoisted(() => ({
  listFoodRecommendations: vi.fn(),
}));
const toastMocks = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/record/food",
  useSearchParams: () => new URLSearchParams(routerMocks.editId ? `edit=${routerMocks.editId}` : ""),
  useRouter: () => ({
    back: routerMocks.back,
  }),
}));

vi.mock("@/api/healthRecords", () => ({
  createFoodRecord: healthRecordMocks.createFoodRecord,
  getHealthRecord: healthRecordMocks.getHealthRecord,
  updateHealthRecord: healthRecordMocks.updateHealthRecord,
}));

vi.mock("@/api/foodRecommendations", () => ({
  listFoodRecommendations: foodRecommendationMocks.listFoodRecommendations,
}));

vi.mock("@/utils/toast", () => ({
  default: {
    error: toastMocks.error,
    success: toastMocks.success,
  },
}));

describe("FoodPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    routerMocks.editId = "";
    foodRecommendationMocks.listFoodRecommendations.mockResolvedValue([]);
  });

  test("shows the food record form", () => {
    render(<QueryProvider><FoodPageClient /></QueryProvider>);

    expect(screen.getByRole("main", { name: "먹은 것 기록 화면" })).toBeInTheDocument();
    expect(screen.getByLabelText("날짜")).toBeInTheDocument();
    expect(screen.getByLabelText("시간")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "기록 찾기" })).toBeInTheDocument();
    expect(screen.getByLabelText("가게·브랜드")).toBeInTheDocument();
    expect(screen.getByLabelText("먹은 것 이름")).toBeInTheDocument();
    expect(screen.getByLabelText("양")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "저장" })).toBeDisabled();
  });

  test("shows recent recommendations without a search and applies one to an empty form", async () => {
    const user = userEvent.setup();
    foodRecommendationMocks.listFoodRecommendations.mockResolvedValue([
      {
        id: "recommendation-1",
        source: "아딸",
        foods: [{ name: "떡볶이" }, { name: "튀김", amount: "3개" }],
      },
    ]);
    render(<QueryProvider><FoodPageClient /></QueryProvider>);

    await user.click(screen.getByRole("button", { name: "기록 찾기" }));

    expect(screen.getByRole("dialog", { name: "이전 기록 불러오기" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "가게 또는 음식 검색" })).toBeInTheDocument();

    await user.click(await screen.findByRole("button", { name: "떡볶이, 튀김 3개 아딸" }));

    expect(screen.getByDisplayValue("아딸")).toBeInTheDocument();
    expect(screen.getByDisplayValue("떡볶이")).toBeInTheDocument();
    expect(screen.getByDisplayValue("튀김")).toBeInTheDocument();
    expect(screen.getByDisplayValue("3개")).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "추천 불러오기" })).not.toBeInTheDocument();
  });

  test("searches recommendations after the input settles", async () => {
    const user = userEvent.setup();
    render(<QueryProvider><FoodPageClient /></QueryProvider>);

    await user.click(screen.getByRole("button", { name: "기록 찾기" }));
    await user.type(screen.getByRole("searchbox", { name: "가게 또는 음식 검색" }), "아딸 튀");

    await waitFor(() => {
      expect(foodRecommendationMocks.listFoodRecommendations).toHaveBeenCalledWith({
        search: "아딸 튀",
      });
    });
    expect(await screen.findByText("찾는 기록이 없어요")).toBeInTheDocument();
    expect(
      screen.getByText("가게나 음식 이름을 바꿔서 검색해 보세요."),
    ).toBeInTheDocument();
  });

  test("keeps loading visible and shows a toast when recommendations fail to load", async () => {
    const user = userEvent.setup();
    foodRecommendationMocks.listFoodRecommendations.mockRejectedValueOnce(
      new Error("network"),
    );
    render(<QueryProvider><FoodPageClient /></QueryProvider>);

    await user.click(screen.getByRole("button", { name: "기록 찾기" }));

    await waitFor(() => {
      expect(toastMocks.error).toHaveBeenCalledWith(
        "음식 추천을 불러오지 못했습니다. 다시 시도해 주세요.",
      );
    });
    expect(screen.queryByText("추천을 불러오지 못했습니다.")).not.toBeInTheDocument();
  });

  test("confirms before replacing an existing food input with a recommendation", async () => {
    const user = userEvent.setup();
    foodRecommendationMocks.listFoodRecommendations.mockResolvedValue([
      {
        id: "recommendation-1",
        source: "아딸",
        foods: [{ name: "떡볶이" }, { name: "튀김" }],
      },
    ]);
    render(<QueryProvider><FoodPageClient /></QueryProvider>);

    await user.type(screen.getByLabelText("먹은 것 이름"), "커피");
    await user.click(screen.getByRole("button", { name: "기록 찾기" }));
    await user.click(await screen.findByRole("button", { name: "떡볶이, 튀김 아딸" }));

    expect(screen.getByDisplayValue("커피")).toBeInTheDocument();
    const dialog = screen.getByRole("dialog", { name: "추천 불러오기" });
    expect(dialog).toHaveTextContent("현재 입력을 추천 내용으로 바꿀까요?");

    await user.click(screen.getByRole("button", { name: "바꾸기" }));

    expect(screen.queryByDisplayValue("커피")).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("아딸")).toBeInTheDocument();
    expect(screen.getByDisplayValue("떡볶이")).toBeInTheDocument();
    expect(screen.getByDisplayValue("튀김")).toBeInTheDocument();
  });

  test("adds and removes a food input", async () => {
    const user = userEvent.setup();
    render(<QueryProvider><FoodPageClient /></QueryProvider>);

    await user.click(screen.getByRole("button", { name: "먹은 것 추가" }));

    expect(screen.getAllByLabelText("먹은 것 이름")).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "먹은 것 삭제" })).toHaveLength(2);

    await user.click(screen.getAllByRole("button", { name: "먹은 것 삭제" })[1]);

    expect(screen.getAllByLabelText("먹은 것 이름")).toHaveLength(1);
  });

  test("saves the entered food items", async () => {
    const user = userEvent.setup();
    healthRecordMocks.createFoodRecord.mockResolvedValue({ id: "record-4" });
    render(<QueryProvider><FoodPageClient /></QueryProvider>);

    await selectTime(user);
    await user.type(screen.getByLabelText("가게·브랜드"), "카페");
    await user.type(screen.getByLabelText("먹은 것 이름"), "커피");
    await user.type(screen.getByLabelText("양"), "2잔");
    await user.click(screen.getByRole("button", { name: "먹은 것 추가" }));
    await user.type(screen.getAllByLabelText("먹은 것 이름")[1], "토스트");
    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(healthRecordMocks.createFoodRecord).toHaveBeenCalledWith({
      date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      time: "08:30",
      source: "카페",
      foods: [
        { name: "커피", amount: "2잔" },
        { name: "토스트", amount: "" },
      ],
    });
    expect(toastMocks.success).toHaveBeenCalledWith("기록을 저장했습니다.");
    expect(routerMocks.back).toHaveBeenCalled();
  });

  test("shows an error toast when saving fails", async () => {
    const user = userEvent.setup();
    healthRecordMocks.createFoodRecord.mockRejectedValue(new Error("save failed"));
    render(<QueryProvider><FoodPageClient /></QueryProvider>);

    await selectTime(user);
    await user.type(screen.getByLabelText("먹은 것 이름"), "커피");
    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => {
      expect(toastMocks.error).toHaveBeenCalledWith(
        "먹은 것 기록을 저장하지 못했습니다. 다시 시도해 주세요.",
      );
    });
    expect(
      screen.queryByText("먹은 것 기록을 저장하지 못했습니다. 다시 시도해 주세요."),
    ).not.toBeInTheDocument();
  });

  test("keeps the form hidden while an existing record is loading", () => {
    routerMocks.editId = "record-4";
    healthRecordMocks.getHealthRecord.mockReturnValue(new Promise(() => {}));

    render(<QueryProvider><FoodPageClient /></QueryProvider>);

    expect(screen.getByRole("main", { name: "먹은 것 기록 수정 화면" })).toBeInTheDocument();
    expect(screen.queryByLabelText("먹은 것 이름")).not.toBeInTheDocument();
  });

  test("loads an existing record and saves it through the edit flow", async () => {
    const user = userEvent.setup();
    routerMocks.editId = "record-4";
    healthRecordMocks.getHealthRecord.mockResolvedValue({
      id: "record-4",
      user_id: "user-1",
      category: "food",
      recorded_at: "2026-07-14T23:30:00.000Z",
      details: { source: "카페", foods: [{ name: "커피", amount: "2잔" }, { name: "토스트" }] },
      details_version: 1,
      created_at: "2026-07-14T23:30:00.000Z",
      updated_at: "2026-07-14T23:30:00.000Z",
    });
    healthRecordMocks.updateHealthRecord.mockResolvedValue({ id: "record-4" });

    render(<QueryProvider><FoodPageClient /></QueryProvider>);

    expect(await screen.findByRole("main", { name: "먹은 것 기록 수정 화면" })).toBeInTheDocument();
    expect(await screen.findByDisplayValue("커피")).toBeInTheDocument();
    expect(screen.getByDisplayValue("토스트")).toBeInTheDocument();
    expect(screen.getByDisplayValue("카페")).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "하단 탭" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "수정 완료" }));

    expect(healthRecordMocks.updateHealthRecord).toHaveBeenCalledWith({
      id: "record-4",
      date: "2026-07-15",
      time: "08:30",
      details: { source: "카페", foods: [{ name: "커피", amount: "2잔" }, { name: "토스트" }] },
    });
    expect(toastMocks.success).toHaveBeenCalledWith("기록을 수정했습니다.");
    expect(routerMocks.back).toHaveBeenCalled();
  });
});

async function selectTime(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByLabelText("시간"));
  await user.click(screen.getAllByRole("option", { name: "08" })[0]);
  await user.click(screen.getAllByRole("option", { name: "30" })[0]);
  await user.click(screen.getByRole("button", { name: "적용하기" }));
}
