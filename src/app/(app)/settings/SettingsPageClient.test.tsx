import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { SettingsPageClient } from "./SettingsPageClient";

const authSessionMocks = vi.hoisted(() => ({
  signOut: vi.fn(),
}));

vi.mock("@/components/auth/AuthGate", () => ({
  useAuthSession: () => ({
    email: "owner@example.com",
    signOut: authSessionMocks.signOut,
  }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/settings",
}));

function createDeferred() {
  let resolve!: () => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, reject, resolve };
}

describe("SettingsPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authSessionMocks.signOut.mockResolvedValue(undefined);
  });

  test("shows the account and active settings tab, and cancels logout", async () => {
    const user = userEvent.setup();

    render(<SettingsPageClient />);

    expect(screen.getByRole("main", { name: "설정 화면" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "설정", level: 1 })).toBeInTheDocument();
    expect(screen.queryByText("계정과 앱 설정")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "계정", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "음식 추천 목록" })).toHaveAttribute(
      "href",
      "/settings/food-recommendations",
    );
    expect(screen.getByText("저장된 음식 조합을 확인하고 삭제해요")).toBeInTheDocument();
    expect(screen.getByText("owner@example.com")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "설정" })).toHaveAttribute("aria-current", "page");

    await user.click(screen.getByRole("button", { name: "로그아웃" }));

    const dialog = screen.getByRole("dialog", { name: "로그아웃" });
    expect(within(dialog).getByText("로그아웃할까요?")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "취소" }));

    expect(screen.queryByRole("dialog", { name: "로그아웃" })).not.toBeInTheDocument();
    expect(authSessionMocks.signOut).not.toHaveBeenCalled();
  });

  test("disables both modal actions and prevents duplicate logout while pending", async () => {
    const user = userEvent.setup();
    const deferred = createDeferred();
    authSessionMocks.signOut.mockReturnValue(deferred.promise);

    render(<SettingsPageClient />);
    await user.click(screen.getByRole("button", { name: "로그아웃" }));

    const dialog = screen.getByRole("dialog", { name: "로그아웃" });
    const cancelButton = within(dialog).getByRole("button", { name: "취소" });
    const confirmButton = within(dialog).getByRole("button", { name: "로그아웃" });
    await user.click(confirmButton);

    expect(authSessionMocks.signOut).toHaveBeenCalledTimes(1);
    expect(cancelButton).toBeDisabled();
    expect(confirmButton).toBeDisabled();
    expect(confirmButton).toHaveAttribute("aria-busy", "true");

    await user.click(confirmButton);
    expect(authSessionMocks.signOut).toHaveBeenCalledTimes(1);

    await user.click(screen.getByTestId("confirm-modal-overlay"));
    expect(screen.getByRole("dialog", { name: "로그아웃" })).toBeInTheDocument();

    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });
  });

  test("keeps the modal open after failure and allows retry", async () => {
    const user = userEvent.setup();
    authSessionMocks.signOut.mockRejectedValueOnce(new Error("network"));

    render(<SettingsPageClient />);
    await user.click(screen.getByRole("button", { name: "로그아웃" }));

    const dialog = screen.getByRole("dialog", { name: "로그아웃" });
    await user.click(within(dialog).getByRole("button", { name: "로그아웃" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "로그아웃하지 못했습니다. 다시 시도해 주세요.",
    );
    expect(screen.getByRole("dialog", { name: "로그아웃" })).toBeInTheDocument();

    authSessionMocks.signOut.mockResolvedValueOnce(undefined);
    await user.click(within(dialog).getByRole("button", { name: "로그아웃" }));

    expect(authSessionMocks.signOut).toHaveBeenCalledTimes(2);
    await waitFor(() => {
      expect(
        screen.queryByText("로그아웃하지 못했습니다. 다시 시도해 주세요."),
      ).not.toBeInTheDocument();
    });
  });
});
