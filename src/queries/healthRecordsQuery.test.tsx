import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { HEALTH_RECORDS_QUERY_KEY, useCreateSleepRecord } from "./healthRecordsQuery";

const healthRecordMocks = vi.hoisted(() => ({
  createSleepRecord: vi.fn(),
}));

vi.mock("@/api/healthRecords", () => ({
  createSleepRecord: healthRecordMocks.createSleepRecord,
}));

describe("useCreateSleepRecord", () => {
  test("invalidates the health records query after saving", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    healthRecordMocks.createSleepRecord.mockResolvedValue({ id: "record-1" });
    queryClient.setQueryData(HEALTH_RECORDS_QUERY_KEY, []);

    const { result } = renderHook(() => useCreateSleepRecord(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    await act(async () => {
      await result.current.mutateAsync({
        date: "2026-07-16",
        time: "23:30",
        event: "slept",
      });
    });

    expect(healthRecordMocks.createSleepRecord).toHaveBeenCalledWith({
      date: "2026-07-16",
      time: "23:30",
      event: "slept",
    });
    expect(queryClient.getQueryState(HEALTH_RECORDS_QUERY_KEY)?.isInvalidated).toBe(true);
  });
});
