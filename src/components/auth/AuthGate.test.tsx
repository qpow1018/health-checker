import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import QueryProvider from "@/components/QueryProvider";

import { AuthGate, useAuthSession } from "./AuthGate";

const routerMocks = vi.hoisted(() => ({
  pathname: "/record",
  replace: vi.fn(),
}));

const authApiMocks = vi.hoisted(() => ({
  checkAllowedUser: vi.fn(),
  getCurrentSession: vi.fn(),
  signOut: vi.fn(),
  subscribeToAuthChanges: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => routerMocks.pathname,
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
    routerMocks.pathname = "/record";
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
      <QueryProvider>
        <AuthGate>
          <ProtectedChild />
        </AuthGate>
      </QueryProvider>,
    );

    expect(await screen.findByRole("heading", { name: "보호된 화면" })).toBeInTheDocument();
    expect(screen.getByText("me@example.com")).toBeInTheDocument();
    expect(authApiMocks.checkAllowedUser).toHaveBeenCalledTimes(1);
  });

  test("keeps protected children visible while rechecking access after navigation", async () => {
    authApiMocks.getCurrentSession.mockResolvedValue({
      user: {
        email: "me@example.com",
      },
    });
    authApiMocks.checkAllowedUser
      .mockResolvedValueOnce(true)
      .mockImplementationOnce(() => new Promise<boolean>(() => undefined));

    const { rerender } = render(
      <QueryProvider>
        <AuthGate>
          <ProtectedChild />
        </AuthGate>
      </QueryProvider>,
    );

    expect(await screen.findByRole("heading", { name: "보호된 화면" })).toBeInTheDocument();

    routerMocks.pathname = "/records";
    rerender(
      <QueryProvider>
        <AuthGate>
          <ProtectedChild />
        </AuthGate>
      </QueryProvider>,
    );

    await waitFor(() => {
      expect(authApiMocks.checkAllowedUser).toHaveBeenCalledTimes(2);
    });
    expect(screen.getByRole("heading", { name: "보호된 화면" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "확인 중" })).not.toBeInTheDocument();
  });

  test("redirects to login when there is no restored session", async () => {
    authApiMocks.getCurrentSession.mockResolvedValue(null);

    render(
      <QueryProvider>
        <AuthGate>
          <ProtectedChild />
        </AuthGate>
      </QueryProvider>,
    );

    await waitFor(() => {
      expect(routerMocks.replace).toHaveBeenCalledWith("/login");
    });
    expect(screen.queryByRole("heading", { name: "보호된 화면" })).not.toBeInTheDocument();
  });

  test("clears cached health data when the access check fails", async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(["health-records"], [{ id: "private-record" }]);
    authApiMocks.getCurrentSession.mockResolvedValue({
      user: {
        email: "me@example.com",
      },
    });
    authApiMocks.checkAllowedUser.mockRejectedValue(new Error("Access check failed"));

    render(
      <QueryClientProvider client={queryClient}>
        <AuthGate>
          <ProtectedChild />
        </AuthGate>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(routerMocks.replace).toHaveBeenCalledWith("/login");
    });
    expect(queryClient.getQueryData(["health-records"])).toBeUndefined();
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
      <QueryProvider>
        <AuthGate>
          <ProtectedChild />
        </AuthGate>
      </QueryProvider>,
    );

    await user.click(await screen.findByRole("button", { name: "로그아웃" }));

    expect(authApiMocks.signOut).toHaveBeenCalledTimes(1);
    expect(routerMocks.replace).toHaveBeenCalledWith("/login");
  });
});
