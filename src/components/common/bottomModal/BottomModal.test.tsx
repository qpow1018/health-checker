import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import BottomModal from "./BottomModal";

describe("BottomModal", () => {
  test("renders labeled dialog content", () => {
    render(
      <BottomModal title="테스트 모달" isOpen={true} onClose={() => undefined}>
        <p>모달 내용</p>
      </BottomModal>,
    );

    expect(screen.getByRole("dialog", { name: "테스트 모달" })).toHaveTextContent(
      "모달 내용",
    );
  });

  test("can render with an aria label without a visible title", () => {
    render(
      <BottomModal ariaLabel="이름만 있는 모달" isOpen={true} onClose={() => undefined}>
        <p>모달 내용</p>
      </BottomModal>,
    );

    expect(screen.getByRole("dialog", { name: "이름만 있는 모달" })).toHaveTextContent(
      "모달 내용",
    );
    expect(screen.queryByRole("heading", { name: "이름만 있는 모달" })).not.toBeInTheDocument();
  });

  test("does not render when closed", () => {
    render(
      <BottomModal title="테스트 모달" isOpen={false} onClose={() => undefined}>
        <p>모달 내용</p>
      </BottomModal>,
    );

    expect(screen.queryByRole("dialog", { name: "테스트 모달" })).not.toBeInTheDocument();
  });

  test("closes on overlay click but keeps modal content clicks inside", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(
      <BottomModal title="테스트 모달" isOpen={true} onClose={handleClose}>
        <button type="button">내부 버튼</button>
      </BottomModal>,
    );

    await user.click(screen.getByRole("button", { name: "내부 버튼" }));
    expect(handleClose).not.toHaveBeenCalled();

    await user.click(screen.getByTestId("bottom-modal-overlay"));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
