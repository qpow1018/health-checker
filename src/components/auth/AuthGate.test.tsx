import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AuthGate, useAuthSession } from "./AuthGate";

const routerMocks = vi.hoisted(() => ({
  replace: vi.fn(),
}));

const authApiMocks = vi.hoisted(() => ({
  checkAllowedUser: vi.fn(),
  getCurrentSession: vi.fn(),
  signOut: vi.fn(),
  subscribeToAuthChanges: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/record",
  useRouter: () => routerMocks,
}));

vi.mock("@/api/auth", () => authApiMocks);

function ProtectedChild() {
  const { email, signOut } = useAuthSession();

  return (
    <section>
      <h1>보호된 화면</h1>
      <p>{email}</p>
      <button type="button" onClick={() => void signOut()}>
        로그아웃
      </button>
    </section>
  );
}

function mockAuthListener() {
  authApiMocks.subscribeToAuthChanges.mockReturnValue({
    data: {
      subscription: {
        unsubscribe: vi.fn(),
      },
    },
  });
}

describe("AuthGate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthListener();
    authApiMocks.signOut.mockResolvedValue(undefined);
  });

  test("renders protected children after an allowed session is restored", async () => {
    authApiMocks.getCurrentSession.mockResolvedValue({
      user: {
        email: "me@example.com",
      },
    });
    authApiMocks.checkAllowedUser.mockResolvedValue(true);

    render(
      <AuthGate>
        <ProtectedChild />
      </AuthGate>,
    );

    expect(await screen.findByRole("heading", { name: "보호된 화면" })).toBeInTheDocument();
    expect(screen.getByText("me@example.com")).toBeInTheDocument();
    expect(authApiMocks.checkAllowedUser).toHaveBeenCalledTimes(1);
  });

  test("redirects to login when there is no restored session", async () => {
    authApiMocks.getCurrentSession.mockResolvedValue(null);

    render(
      <AuthGate>
        <ProtectedChild />
      </AuthGate>,
    );

    await waitFor(() => {
      expect(routerMocks.replace).toHaveBeenCalledWith("/login");
    });
    expect(screen.queryByRole("heading", { name: "보호된 화면" })).not.toBeInTheDocument();
  });

  test("signs out through auth context and returns to login", async () => {
    const user = userEvent.setup();
    authApiMocks.getCurrentSession.mockResolvedValue({
      user: {
        email: "me@example.com",
      },
    });
    authApiMocks.checkAllowedUser.mockResolvedValue(true);

    render(
      <AuthGate>
        <ProtectedChild />
      </AuthGate>,
    );

    await user.click(await screen.findByRole("button", { name: "로그아웃" }));

    expect(authApiMocks.signOut).toHaveBeenCalledTimes(1);
    expect(routerMocks.replace).toHaveBeenCalledWith("/login");
  });
});
