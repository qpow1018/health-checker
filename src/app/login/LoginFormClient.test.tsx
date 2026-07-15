import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { LoginFormClient } from "./LoginFormClient";

const routerMocks = vi.hoisted(() => ({
  replace: vi.fn(),
}));

const authApiMocks = vi.hoisted(() => ({
  checkAllowedUser: vi.fn(),
  getCurrentSession: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: routerMocks.replace,
  }),
}));

vi.mock("@/api/auth", () => authApiMocks);

describe("LoginFormClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authApiMocks.getCurrentSession.mockResolvedValue(null);
    authApiMocks.signOut.mockResolvedValue(undefined);
  });

  test("signs in with normalized email and enters the app when the account is allowed", async () => {
    const user = userEvent.setup();
    authApiMocks.signInWithPassword.mockResolvedValue({
      user: {
        email: "me@example.com",
      },
    });
    authApiMocks.checkAllowedUser.mockResolvedValue(true);

    render(<LoginFormClient />);

    await user.type(await screen.findByLabelText("이메일"), "ME@example.com");
    await user.type(screen.getByLabelText("비밀번호"), "secret-password");
    await user.click(screen.getByRole("button", { name: "로그인" }));

    expect(authApiMocks.signInWithPassword).toHaveBeenCalledWith({
      email: "me@example.com",
      password: "secret-password",
    });
    expect(authApiMocks.checkAllowedUser).toHaveBeenCalledTimes(1);
    expect(routerMocks.replace).toHaveBeenCalledWith("/record");
  });

  test("keeps a blocked account outside the app", async () => {
    const user = userEvent.setup();
    authApiMocks.signInWithPassword.mockResolvedValue({
      user: {
        email: "blocked@example.com",
      },
    });
    authApiMocks.checkAllowedUser.mockResolvedValue(false);

    render(<LoginFormClient />);

    await user.type(await screen.findByLabelText("이메일"), "blocked@example.com");
    await user.type(screen.getByLabelText("비밀번호"), "secret-password");
    await user.click(screen.getByRole("button", { name: "로그인" }));

    await waitFor(() => {
      expect(
        screen.getByText("이 계정은 Health Checker에 접근할 수 없습니다."),
      ).toBeInTheDocument();
    });
    expect(authApiMocks.signOut).toHaveBeenCalledTimes(1);
    expect(routerMocks.replace).not.toHaveBeenCalledWith("/record");
  });

  test("shows an app message when login fields are empty", async () => {
    const user = userEvent.setup();

    render(<LoginFormClient />);

    await screen.findByLabelText("이메일");
    await user.click(screen.getByRole("button", { name: "로그인" }));

    expect(screen.getByText("이메일과 비밀번호를 입력해주세요.")).toBeInTheDocument();
    expect(authApiMocks.signInWithPassword).not.toHaveBeenCalled();
  });
});
