import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AuthGate } from "./AuthGate";

const supabaseMocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  rpc: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      getSession: supabaseMocks.getSession,
      onAuthStateChange: supabaseMocks.onAuthStateChange,
      signInWithPassword: supabaseMocks.signInWithPassword,
      signOut: supabaseMocks.signOut,
    },
    rpc: supabaseMocks.rpc,
  }),
}));

function mockSignedOutSession() {
  supabaseMocks.getSession.mockResolvedValue({ data: { session: null } });
  supabaseMocks.onAuthStateChange.mockReturnValue({
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
    mockSignedOutSession();
  });

  test("shows the login form when there is no session", async () => {
    render(<AuthGate />);

    expect(await screen.findByRole("heading", { name: "로그인" })).toBeInTheDocument();
    expect(screen.getByLabelText("이메일")).toBeInTheDocument();
    expect(screen.getByLabelText("비밀번호")).toBeInTheDocument();
  });

  test("checks allowlist after password login and shows record home", async () => {
    const user = userEvent.setup();
    supabaseMocks.signInWithPassword.mockResolvedValue({
      data: {
        session: {
          user: {
            email: "me@example.com",
          },
        },
      },
      error: null,
    });
    supabaseMocks.rpc.mockResolvedValue({ data: true, error: null });

    render(<AuthGate />);

    await user.type(await screen.findByLabelText("이메일"), "ME@example.com");
    await user.type(screen.getByLabelText("비밀번호"), "secret-password");
    await user.click(screen.getByRole("button", { name: "로그인" }));

    expect(supabaseMocks.signInWithPassword).toHaveBeenCalledWith({
      email: "me@example.com",
      password: "secret-password",
    });
    expect(supabaseMocks.rpc).toHaveBeenCalledWith("is_allowed_user");
    expect(await screen.findByRole("heading", { name: "화장실 기록" })).toBeInTheDocument();
    expect(screen.getByText("me@example.com")).toBeInTheDocument();
  });

  test("blocks a signed-in user when allowlist check returns false", async () => {
    const user = userEvent.setup();
    supabaseMocks.signInWithPassword.mockResolvedValue({
      data: {
        session: {
          user: {
            email: "blocked@example.com",
          },
        },
      },
      error: null,
    });
    supabaseMocks.rpc.mockResolvedValue({ data: false, error: null });

    render(<AuthGate />);

    await user.type(await screen.findByLabelText("이메일"), "blocked@example.com");
    await user.type(screen.getByLabelText("비밀번호"), "secret-password");
    await user.click(screen.getByRole("button", { name: "로그인" }));

    await waitFor(() => {
      expect(
        screen.getByText("이 계정은 Health Checker에 접근할 수 없습니다."),
      ).toBeInTheDocument();
    });
  });
});
