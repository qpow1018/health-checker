import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import QueryProvider from "@/components/QueryProvider";

import FavoritesPageClient from "./FavoritesPageClient";

const recordFavoriteMocks = vi.hoisted(() => ({
  deleteRecordFavorite: vi.fn(),
  listRecordFavorites: vi.fn(),
  reorderRecordFavorites: vi.fn(),
  updateRecordFavoriteTitle: vi.fn(),
}));
const toastMocks = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}));

vi.mock("@/api/recordFavorites", () => ({
  deleteRecordFavorite: recordFavoriteMocks.deleteRecordFavorite,
  listRecordFavorites: recordFavoriteMocks.listRecordFavorites,
  reorderRecordFavorites: recordFavoriteMocks.reorderRecordFavorites,
  updateRecordFavoriteTitle: recordFavoriteMocks.updateRecordFavoriteTitle,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn() }),
}));

vi.mock("@/utils/toast", () => ({
  default: {
    error: toastMocks.error,
    success: toastMocks.success,
  },
}));

describe("FavoritesPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    recordFavoriteMocks.listRecordFavorites.mockResolvedValue([
      createFavorite("favorite-1", "아침 커피", 0),
      createFavorite("favorite-2", "점심 커피", 1),
    ]);
    recordFavoriteMocks.updateRecordFavoriteTitle.mockResolvedValue({
      ...createFavorite("favorite-1", "출근 커피", 0),
    });
    recordFavoriteMocks.deleteRecordFavorite.mockResolvedValue(undefined);
    recordFavoriteMocks.reorderRecordFavorites.mockResolvedValue(undefined);
  });

  test("changes only a favorite name", async () => {
    const user = userEvent.setup();
    render(<QueryProvider><FavoritesPageClient /></QueryProvider>);

    const list = await screen.findByRole("list");
    const firstItem = within(list).getAllByRole("listitem")[0];
    await user.click(within(firstItem).getByRole("button", { name: "이름 변경" }));

    const dialog = screen.getByRole("dialog", { name: "즐겨찾기 이름 변경" });
    const input = within(dialog).getByRole("textbox", { name: "즐겨찾기 이름" });
    await user.clear(input);
    await user.type(input, "출근 커피");
    await user.click(within(dialog).getByRole("button", { name: "변경" }));

    expect(recordFavoriteMocks.updateRecordFavoriteTitle).toHaveBeenCalledWith({
      id: "favorite-1",
      title: "출근 커피",
    });
    expect(toastMocks.success).toHaveBeenCalledWith("즐겨찾기 이름을 변경했습니다.");
  });

  test("deletes a favorite without deleting health records", async () => {
    const user = userEvent.setup();
    render(<QueryProvider><FavoritesPageClient /></QueryProvider>);

    const list = await screen.findByRole("list");
    const firstItem = within(list).getAllByRole("listitem")[0];
    await user.click(within(firstItem).getByRole("button", { name: "삭제" }));

    const dialog = screen.getByRole("dialog", {
      name: "이 즐겨찾기를 삭제할까요?",
    });
    expect(within(dialog).getByText("기존 건강 기록은 유지됩니다.")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "삭제" }));

    await waitFor(() => {
      expect(recordFavoriteMocks.deleteRecordFavorite).toHaveBeenCalledWith("favorite-1");
    });
    expect(toastMocks.success).toHaveBeenCalledWith("즐겨찾기를 삭제했습니다.");
  });

  test("exposes an accessible drag handle for every favorite", async () => {
    render(<QueryProvider><FavoritesPageClient /></QueryProvider>);

    expect(
      await screen.findByRole("button", { name: "아침 커피 순서 변경" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "점심 커피 순서 변경" }),
    ).toBeInTheDocument();
  });
});

function createFavorite(id: string, title: string, sortOrder: number) {
  return {
    id,
    user_id: "user-1",
    title,
    category: "food",
    details: { foods: [{ name: "커피", amount: "1잔" }] },
    details_version: 1,
    sort_order: sortOrder,
    created_at: "2026-07-20T08:00:00.000Z",
    updated_at: "2026-07-20T08:00:00.000Z",
  };
}
