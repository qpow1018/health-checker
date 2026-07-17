import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import ConfirmModal from "./ConfirmModal";

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
          color: "danger",
          onClick: () => undefined,
        }}
      />,
    );

    const dialog = screen.getByRole("dialog", { name: "기록을 취소할까요?" });

    expect(dialog).toHaveTextContent("방금 저장한 기록이 삭제됩니다.");
    expect(screen.getByRole("button", { name: "닫기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "취소하기" })).toHaveAttribute(
      "data-color",
      "danger",
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
          color: "danger",
          onClick: () => undefined,
        }}
      />,
    );

    expect(screen.queryByRole("dialog", { name: "기록 삭제" })).not.toBeInTheDocument();
  });

  test("locks background scrolling while open", () => {
    const { rerender } = render(
      <ConfirmModal
        isOpen={true}
        onClose={() => undefined}
        title="기록 삭제"
        message="삭제할까요?"
        cancelButton={{ label: "닫기", onClick: () => undefined }}
        confirmButton={{ label: "삭제", color: "danger", onClick: () => undefined }}
      />,
    );

    expect(document.body.style.position).toBe("fixed");

    rerender(
      <ConfirmModal
        isOpen={false}
        onClose={() => undefined}
        title="기록 삭제"
        message="삭제할까요?"
        cancelButton={{ label: "닫기", onClick: () => undefined }}
        confirmButton={{ label: "삭제", color: "danger", onClick: () => undefined }}
      />,
    );

    expect(document.body.style.position).toBe("");
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
          color: "danger",
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

  test("disables both actions while confirming", () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={() => undefined}
        title="복원할까요?"
        message="기존 기록이 교체됩니다."
        cancelButton={{ label: "닫기", onClick: () => undefined }}
        confirmButton={{
          label: "복원",
          color: "primary",
          isLoading: true,
          onClick: () => undefined,
        }}
      />,
    );

    expect(screen.getByRole("button", { name: "닫기" })).toBeDisabled();
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
            color: "danger",
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
              color: "danger",
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

  test("keeps focus inside and blocks dismissal while actions are pending", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    const handleCancel = vi.fn();

    const { rerender } = render(
      <ConfirmModal
        isOpen={true}
        onClose={handleClose}
        title="로그아웃"
        message="로그아웃할까요?"
        cancelButton={{
          label: "취소",
          onClick: handleCancel,
        }}
        confirmButton={{
          label: "로그아웃",
          color: "danger",
          onClick: () => undefined,
        }}
      />,
    );

    const dialog = screen.getByRole("dialog", { name: "로그아웃" });
    const cancelButton = screen.getByRole("button", { name: "취소" });
    const confirmButton = screen.getByRole("button", { name: "로그아웃" });

    expect(cancelButton).toHaveFocus();

    rerender(
      <ConfirmModal
        isOpen={true}
        onClose={handleClose}
        title="로그아웃"
        message="로그아웃할까요?"
        cancelButton={{
          label: "취소",
          onClick: handleCancel,
        }}
        confirmButton={{
          label: "로그아웃",
          color: "danger",
          isLoading: true,
          onClick: () => undefined,
        }}
      />,
    );

    expect(dialog).toHaveFocus();
    expect(cancelButton).toBeDisabled();
    expect(confirmButton).toBeDisabled();

    await user.click(screen.getByTestId("confirm-modal-overlay"));
    await user.keyboard("{Escape}");
    await user.click(cancelButton);

    expect(handleClose).not.toHaveBeenCalled();
    expect(handleCancel).not.toHaveBeenCalled();

    await user.tab();
    expect(dialog).toHaveFocus();

    rerender(
      <ConfirmModal
        isOpen={true}
        onClose={handleClose}
        title="로그아웃"
        message="로그아웃할까요?"
        cancelButton={{
          label: "취소",
          onClick: handleCancel,
        }}
        confirmButton={{
          label: "로그아웃",
          color: "danger",
          onClick: () => undefined,
        }}
      />,
    );

    expect(cancelButton).toBeEnabled();
    expect(confirmButton).toBeEnabled();

    await user.click(cancelButton);
    await user.click(screen.getByTestId("confirm-modal-overlay"));
    await user.keyboard("{Escape}");

    expect(handleCancel).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
