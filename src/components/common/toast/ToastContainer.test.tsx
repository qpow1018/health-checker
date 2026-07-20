import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import toast, { getToastSnapshot, removeToast } from "@/utils/toast";

import ToastContainer from "./ToastContainer";

describe("ToastContainer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      getToastSnapshot().forEach((toastItem) => removeToast(toastItem.id));
    });
    vi.useRealTimers();
  });

  test("shows a toast and removes it after its duration", () => {
    render(<ToastContainer />);

    act(() => {
      toast.success("기록을 저장했습니다.", { duration: 1000 });
    });

    expect(screen.getByRole("status")).toHaveTextContent("기록을 저장했습니다.");

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  test("removes a toast with its close button", () => {
    render(<ToastContainer />);

    act(() => {
      toast.error("기록 저장에 실패했습니다.", { isShowCloseButton: true });
    });

    fireEvent.click(screen.getByRole("button", { name: "알림 닫기" }));

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  test("keeps only the latest three toasts", () => {
    render(<ToastContainer />);

    act(() => {
      toast.info("첫 번째");
      toast.info("두 번째");
      toast.info("세 번째");
      toast.info("네 번째");
    });

    expect(screen.queryByText("첫 번째")).not.toBeInTheDocument();
    expect(screen.getAllByRole("status")).toHaveLength(3);
  });
});
