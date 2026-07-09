import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { ConfirmModal } from "./ConfirmModal";

describe("ConfirmModal", () => {
  test("renders a centered confirmation dialog", () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={() => undefined}
        title="기록을 취소할까요?"
        message="방금 저장한 기록이 삭제됩니다."
        cancelButton={{ label: "닫기", onClick: () => undefined }}
        confirmButton={{
          label: "취소하기",
          variant: "destructive",
          onClick: () => undefined,
        }}
      />,
    );

    const dialog = screen.getByRole("dialog", { name: "기록을 취소할까요?" });

    expect(dialog).toHaveTextContent("방금 저장한 기록이 삭제됩니다.");
    expect(screen.getByRole("button", { name: "닫기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "취소하기" })).toHaveAttribute(
      "data-variant",
      "destructive",
    );
  });

  test("does not render when closed", () => {
    render(
      <ConfirmModal
        isOpen={false}
        onClose={() => undefined}
        title="기록 삭제"
        message="삭제할까요?"
        cancelButton={{ label: "닫기", onClick: () => undefined }}
        confirmButton={{
          label: "삭제",
          variant: "destructive",
          onClick: () => undefined,
        }}
      />,
    );

    expect(screen.queryByRole("dialog", { name: "기록 삭제" })).not.toBeInTheDocument();
  });

  test("calls the requested handlers for overlay, cancel, and confirm actions", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    const handleCancel = vi.fn();
    const handleConfirm = vi.fn();

    render(
      <ConfirmModal
        isOpen={true}
        onClose={handleClose}
        title="기록 삭제"
        message="이 기록을 삭제할까요?"
        cancelButton={{ label: "닫기", onClick: handleCancel }}
        confirmButton={{
          label: "삭제",
          variant: "destructive",
          onClick: handleConfirm,
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "닫기" }));
    await user.click(screen.getByRole("button", { name: "삭제" }));
    await user.click(screen.getByTestId("confirm-modal-overlay"));

    expect(handleCancel).toHaveBeenCalledTimes(1);
    expect(handleConfirm).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test("disables the confirm button while confirming", () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={() => undefined}
        title="복원할까요?"
        message="기존 기록이 교체됩니다."
        cancelButton={{ label: "닫기", onClick: () => undefined }}
        confirmButton={{
          label: "복원",
          variant: "primary",
          isLoading: true,
          onClick: () => undefined,
        }}
      />,
    );

    expect(screen.getByRole("button", { name: "복원" })).toBeDisabled();
  });

  test("moves focus into the dialog and traps Tab across enabled actions", async () => {
    const user = userEvent.setup();

    render(
      <>
        <button type="button">가려진 화면</button>
        <ConfirmModal
          isOpen={true}
          onClose={() => undefined}
          title="기록 삭제"
          message="삭제할까요?"
          cancelButton={{ label: "닫기", onClick: () => undefined }}
          confirmButton={{
            label: "삭제",
            variant: "destructive",
            onClick: () => undefined,
          }}
        />
      </>,
    );

    const cancelButton = screen.getByRole("button", { name: "닫기" });
    const confirmButton = screen.getByRole("button", { name: "삭제" });

    expect(cancelButton).toHaveFocus();

    await user.tab({ shift: true });
    expect(confirmButton).toHaveFocus();

    await user.tab();
    expect(cancelButton).toHaveFocus();
  });

  test("closes with Escape and restores focus to the opener", async () => {
    const user = userEvent.setup();

    function ConfirmModalHarness() {
      const [isOpen, setIsOpen] = useState(false);

      return (
        <>
          <button type="button" onClick={() => setIsOpen(true)}>
            모달 열기
          </button>
          <ConfirmModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title="기록 삭제"
            message="삭제할까요?"
            cancelButton={{ label: "닫기", onClick: () => setIsOpen(false) }}
            confirmButton={{
              label: "삭제",
              variant: "destructive",
              onClick: () => undefined,
            }}
          />
        </>
      );
    }

    render(<ConfirmModalHarness />);

    const opener = screen.getByRole("button", { name: "모달 열기" });
    await user.click(opener);
    expect(screen.getByRole("button", { name: "닫기" })).toHaveFocus();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  test("keeps focus inside and ignores Escape while actions are pending", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(
      <ConfirmModal
        isOpen={true}
        onClose={handleClose}
        title="로그아웃"
        message="로그아웃할까요?"
        cancelButton={{
          label: "취소",
          isDisabled: true,
          onClick: () => undefined,
        }}
        confirmButton={{
          label: "로그아웃",
          variant: "destructive",
          isLoading: true,
          onClick: () => undefined,
        }}
      />,
    );

    const dialog = screen.getByRole("dialog", { name: "로그아웃" });
    expect(dialog).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(handleClose).not.toHaveBeenCalled();

    await user.tab();
    expect(dialog).toHaveFocus();
  });
});
