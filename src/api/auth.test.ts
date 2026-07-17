import { beforeEach, describe, expect, test, vi } from "vitest";

import { signOut } from "./auth";

const supabaseMocks = vi.hoisted(() => ({
  signOut: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      signOut: supabaseMocks.signOut,
    },
  }),
}));

describe("signOut", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("signs out only the current browser session", async () => {
    supabaseMocks.signOut.mockResolvedValue({ error: null });

    await signOut();

    expect(supabaseMocks.signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  test("rejects with the error returned by Supabase", async () => {
    const error = new Error("sign out failed");
    supabaseMocks.signOut.mockResolvedValue({ error });

    await expect(signOut()).rejects.toBe(error);
  });
});
