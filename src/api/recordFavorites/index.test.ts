import { beforeEach, describe, expect, test, vi } from "vitest";

import {
  createHealthRecordFromFavorite,
  createRecordFavorite,
  deleteRecordFavorite,
  listRecordFavorites,
  reorderRecordFavorites,
  updateRecordFavoriteTitle,
} from "./index";

const supabaseMocks = vi.hoisted(() => ({
  from: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => ({
    from: supabaseMocks.from,
    rpc: supabaseMocks.rpc,
  }),
}));

describe("recordFavorites API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("lists favorites in the saved order with newest ties first", async () => {
    const createdOrder = vi.fn().mockResolvedValue({ data: [], error: null });
    const sortOrder = vi.fn().mockReturnValue({ order: createdOrder });
    const select = vi.fn().mockReturnValue({ order: sortOrder });
    supabaseMocks.from.mockReturnValue({ select });

    await listRecordFavorites();

    expect(supabaseMocks.from).toHaveBeenCalledWith("record_favorites");
    expect(sortOrder).toHaveBeenCalledWith("sort_order", { ascending: true });
    expect(createdOrder).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  test("creates a favorite snapshot from a record with a trimmed title", async () => {
    supabaseMocks.rpc.mockResolvedValue({ data: { id: "favorite-1" }, error: null });

    await createRecordFavorite({ recordId: "record-1", title: " 아침 커피 " });

    expect(supabaseMocks.rpc).toHaveBeenCalledWith("create_record_favorite", {
      favorite_title_value: "아침 커피",
      record_id_value: "record-1",
    });
  });

  test("creates a health record from the selected favorite", async () => {
    supabaseMocks.rpc.mockResolvedValue({ data: { id: "record-2" }, error: null });

    await createHealthRecordFromFavorite("favorite-1");

    expect(supabaseMocks.rpc).toHaveBeenCalledWith(
      "create_health_record_from_favorite",
      { favorite_id_value: "favorite-1" },
    );
  });

  test("updates only the selected favorite title", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { id: "favorite-1", title: "점심" },
      error: null,
    });
    const select = vi.fn().mockReturnValue({ maybeSingle });
    const eq = vi.fn().mockReturnValue({ select });
    const update = vi.fn().mockReturnValue({ eq });
    supabaseMocks.from.mockReturnValue({ update });

    await updateRecordFavoriteTitle({ id: "favorite-1", title: " 점심 " });

    expect(update).toHaveBeenCalledWith({ title: "점심" });
    expect(eq).toHaveBeenCalledWith("id", "favorite-1");
  });

  test("deletes only the selected favorite", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const deleteFavorites = vi.fn().mockReturnValue({ eq });
    supabaseMocks.from.mockReturnValue({ delete: deleteFavorites });

    await deleteRecordFavorite("favorite-1");

    expect(eq).toHaveBeenCalledWith("id", "favorite-1");
  });

  test("saves the complete favorite order atomically", async () => {
    supabaseMocks.rpc.mockResolvedValue({ data: undefined, error: null });

    await reorderRecordFavorites(["favorite-2", "favorite-1"]);

    expect(supabaseMocks.rpc).toHaveBeenCalledWith("reorder_record_favorites", {
      favorite_ids: ["favorite-2", "favorite-1"],
    });
  });
});
