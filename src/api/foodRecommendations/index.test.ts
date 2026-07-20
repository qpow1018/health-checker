import { beforeEach, describe, expect, test, vi } from "vitest";

import {
  deleteFoodRecommendation,
  listAllFoodRecommendations,
  listFoodRecommendations,
} from "./index";

const supabaseMocks = vi.hoisted(() => ({
  from: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => ({
    from: supabaseMocks.from,
  }),
}));

describe("foodRecommendations API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("searches every term and returns at most five recent recommendations", async () => {
    const response = {
      data: [createFoodRecommendationRow()],
      error: null,
    };
    const query = createAwaitableQuery(response);
    const limit = vi.fn().mockReturnValue(query);
    const order = vi.fn().mockReturnValue({ limit });
    const select = vi.fn().mockReturnValue({ order });
    supabaseMocks.from.mockReturnValue({ select });

    const recommendations = await listFoodRecommendations({ search: " 아딸   튀 " });

    expect(supabaseMocks.from).toHaveBeenCalledWith("food_recommendations");
    expect(order).toHaveBeenCalledWith("last_used_at", { ascending: false });
    expect(limit).toHaveBeenCalledWith(5);
    expect(query.ilike).toHaveBeenNthCalledWith(1, "search_text", "%아딸%");
    expect(query.ilike).toHaveBeenNthCalledWith(2, "search_text", "%튀%");
    expect(recommendations).toEqual([
      {
        id: "recommendation-1",
        source: "아딸",
        foods: [{ name: "떡볶이" }, { name: "튀김", amount: "3개" }],
      },
    ]);
  });

  test("escapes wildcard characters in a search term", async () => {
    const query = createAwaitableQuery({ data: [], error: null });
    const limit = vi.fn().mockReturnValue(query);
    const order = vi.fn().mockReturnValue({ limit });
    const select = vi.fn().mockReturnValue({ order });
    supabaseMocks.from.mockReturnValue({ select });

    await listFoodRecommendations({ search: "50%_" });

    expect(query.ilike).toHaveBeenCalledWith("search_text", "%50\\%\\_%");
  });

  test("lists every recommendation in recent order", async () => {
    const order = vi.fn().mockResolvedValue({
      data: [createFoodRecommendationRow()],
      error: null,
    });
    const select = vi.fn().mockReturnValue({ order });
    supabaseMocks.from.mockReturnValue({ select });

    const recommendations = await listAllFoodRecommendations();

    expect(order).toHaveBeenCalledWith("last_used_at", { ascending: false });
    expect(recommendations).toHaveLength(1);
  });

  test("deletes only the selected recommendation", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const deleteRecommendations = vi.fn().mockReturnValue({ eq });
    supabaseMocks.from.mockReturnValue({ delete: deleteRecommendations });

    await deleteFoodRecommendation("recommendation-1");

    expect(deleteRecommendations).toHaveBeenCalledOnce();
    expect(eq).toHaveBeenCalledWith("id", "recommendation-1");
  });
});

function createAwaitableQuery(response: { data: unknown[]; error: null }) {
  const query = {
    ilike: vi.fn(),
    then<TResult1 = typeof response, TResult2 = never>(
      onFulfilled?: ((value: typeof response) => TResult1 | PromiseLike<TResult1>) | null,
      onRejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
    ) {
      return Promise.resolve(response).then(onFulfilled, onRejected);
    },
  };
  query.ilike.mockReturnValue(query);
  return query;
}

function createFoodRecommendationRow() {
  return {
    id: "recommendation-1",
    user_id: "user-1",
    source: "아딸",
    foods: [{ name: " 떡볶이 " }, { name: "튀김", amount: " 3개 " }],
    normalized_key: "key",
    search_text: "아딸 떡볶이 튀김",
    last_used_at: "2026-07-20T04:00:00.000Z",
    created_at: "2026-07-20T04:00:00.000Z",
    updated_at: "2026-07-20T04:00:00.000Z",
  };
}
