import { render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import useScrollLock from "./useScrollLock";

function ScrollLockHarness({ isLocked }: { isLocked: boolean }) {
  useScrollLock(isLocked);

  return null;
}

describe("useScrollLock", () => {
  test("keeps the body locked until every lock is released", () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    const { rerender } = render(
      <>
        <ScrollLockHarness isLocked={true} />
        <ScrollLockHarness isLocked={true} />
      </>,
    );

    expect(document.body.style.position).toBe("fixed");

    rerender(
      <>
        <ScrollLockHarness isLocked={false} />
        <ScrollLockHarness isLocked={true} />
      </>,
    );

    expect(document.body.style.position).toBe("fixed");

    rerender(
      <>
        <ScrollLockHarness isLocked={false} />
        <ScrollLockHarness isLocked={false} />
      </>,
    );

    expect(document.body.style.position).toBe("");
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });
});
