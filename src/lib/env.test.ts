import { afterEach, describe, expect, test, vi } from "vitest";

const originalEnv = process.env;

describe("getPublicEnv", () => {
  afterEach(() => {
    vi.resetModules();
    process.env = originalEnv;
  });

  test("returns required Supabase public environment values", async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
    };

    const { getPublicEnv } = await import("./env");

    expect(getPublicEnv()).toEqual({
      supabaseUrl: "https://example.supabase.co",
      supabasePublishableKey: "publishable-key",
    });
  });

  test("throws when a required public environment value is missing", async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
    };

    const { getPublicEnv } = await import("./env");

    expect(() => getPublicEnv()).toThrow(
      "Missing public environment values: supabaseUrl",
    );
  });
});
