import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import QueryProvider from "@/components/QueryProvider";

import FoodRecommendationsPageClient from "./FoodRecommendationsPageClient";

const routerMocks = vi.hoisted(() => ({
  back: vi.fn(),
}));
const foodRecommendationMocks = vi.hoisted(() => ({
  deleteFoodRecommendation: vi.fn(),
  listAllFoodRecommendations: vi.fn(),
}));
const toastMocks = vi.hoisted(() => ({
  error: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: routerMocks.back }),
}));

vi.mock("@/api/foodRecommendations", () => ({
  deleteFoodRecommendation: foodRecommendationMocks.deleteFoodRecommendation,
  listAllFoodRecommendations: foodRecommendationMocks.listAllFoodRecommendations,
}));

vi.mock("@/components/common/loading/BoxLoading", () => ({
  default: () => <div data-testid="box-loading" />,
}));

vi.mock("@/utils/toast", () => ({
  default: {
    error: toastMocks.error,
  },
}));

describe("FoodRecommendationsPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    foodRecommendationMocks.listAllFoodRecommendations.mockResolvedValue([
      {
        id: "recommendation-1",
        source: "아딸",
        foods: [{ name: "떡볶이" }, { name: "튀김" }],
      },
      {
        id: "recommendation-2",
        foods: [{ name: "커피", amount: "2잔" }],
      },
    ]);
    foodRecommendationMocks.deleteFoodRecommendation.mockResolvedValue(undefined);
  });

  test("shows every saved recommendation", async () => {
    render(
      <QueryProvider>
        <FoodRecommendationsPageClient />
      </QueryProvider>,
    );

    const firstRecommendation = (await screen.findByText("떡볶이, 튀김")).closest("li");

    expect(firstRecommendation).not.toBeNull();
    expect(within(firstRecommendation as HTMLElement).getByText("아딸")).toBeInTheDocument();
    expect(screen.getByRole("main", { name: "음식 추천 목록 설정 화면" })).toBeInTheDocument();
    expect(screen.getByText("커피 2잔")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "삭제" })).toHaveLength(2);
  });

  test("deletes a recommendation after confirmation", async () => {
    const user = userEvent.setup();
    render(
      <QueryProvider>
        <FoodRecommendationsPageClient />
      </QueryProvider>,
    );

    await screen.findByText("떡볶이, 튀김");
    await user.click(screen.getAllByRole("button", { name: "삭제" })[0]);

    const dialog = screen.getByRole("dialog", { name: "음식 추천 삭제" });
    expect(dialog).toHaveTextContent("기존 먹은 것 기록은 유지됩니다.");
    await user.click(within(dialog).getByRole("button", { name: "삭제" }));

    expect(foodRecommendationMocks.deleteFoodRecommendation).toHaveBeenCalledWith(
      "recommendation-1",
    );
  });

  test("keeps loading visible and shows a toast when recommendations fail to load", async () => {
    foodRecommendationMocks.listAllFoodRecommendations.mockRejectedValueOnce(
      new Error("network"),
    );

    render(
      <QueryProvider>
        <FoodRecommendationsPageClient />
      </QueryProvider>,
    );

    expect(screen.getByTestId("box-loading")).toBeInTheDocument();
    await waitFor(() => {
      expect(toastMocks.error).toHaveBeenCalledWith(
        "음식 추천을 불러오지 못했습니다. 다시 시도해 주세요.",
      );
    });
    expect(screen.queryByText("음식 추천을 불러오지 못했습니다.")).not.toBeInTheDocument();
  });

  test("keeps the confirmation open and shows a toast when deletion fails", async () => {
    const user = userEvent.setup();
    foodRecommendationMocks.deleteFoodRecommendation.mockRejectedValueOnce(
      new Error("network"),
    );

    render(
      <QueryProvider>
        <FoodRecommendationsPageClient />
      </QueryProvider>,
    );

    await screen.findByText("떡볶이, 튀김");
    await user.click(screen.getAllByRole("button", { name: "삭제" })[0]);

    const dialog = screen.getByRole("dialog", { name: "음식 추천 삭제" });
    await user.click(within(dialog).getByRole("button", { name: "삭제" }));

    expect(toastMocks.error).toHaveBeenCalledWith(
      "음식 추천을 삭제하지 못했습니다. 다시 시도해 주세요.",
    );
    expect(dialog).toBeInTheDocument();
    expect(
      screen.queryByText("음식 추천을 삭제하지 못했습니다. 다시 시도해 주세요."),
    ).not.toBeInTheDocument();
  });
});
