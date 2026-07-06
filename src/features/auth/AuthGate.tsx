"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { RecordHome } from "@/features/records/RecordHome";

type AuthState = "loading" | "signed-out" | "checking-access" | "allowed" | "blocked";

export function AuthGate() {
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let ignore = false;
    const supabase = getSupabaseBrowserClient();

    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      if (ignore) return;
      setSession(data.session);
      if (data.session) {
        await checkAccess(data.session);
      } else {
        setAuthState("signed-out");
      }
    }

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
        if (nextSession) {
          void checkAccess(nextSession);
        } else {
          setAuthState("signed-out");
        }
      },
    );

    void loadSession();

    return () => {
      ignore = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function checkAccess(nextSession: Session) {
    const supabase = getSupabaseBrowserClient();

    setAuthState("checking-access");
    setMessage("");

    const { data, error } = await supabase.rpc("is_allowed_user");
    if (error) {
      setAuthState("blocked");
      setMessage("접근 권한을 확인하지 못했습니다.");
      return;
    }

    if (data === true) {
      setAuthState("allowed");
      setSession(nextSession);
      return;
    }

    setAuthState("blocked");
    setMessage("이 계정은 Health Checker에 접근할 수 없습니다.");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      setMessage("이메일 또는 비밀번호를 확인해주세요.");
      return;
    }

    if (data.session) {
      await checkAccess(data.session);
    }
  }

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();

    await supabase.auth.signOut();
    setPassword("");
    setAuthState("signed-out");
  }

  if (authState === "loading" || authState === "checking-access") {
    return (
      <main className="app-shell">
        <section className="surface stack">
          <p className="eyebrow">Health Checker</p>
          <h1>확인 중</h1>
          <p className="muted">계정 접근 권한을 확인하고 있습니다.</p>
        </section>
      </main>
    );
  }

  if (authState === "allowed" && session?.user.email) {
    return <RecordHome email={session.user.email} onSignOut={handleSignOut} />;
  }

  return (
    <main className="app-shell">
      <section className="surface stack">
        <div>
          <p className="eyebrow">Health Checker</p>
          <h1>로그인</h1>
          <p className="muted">허용된 계정만 사용할 수 있습니다.</p>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span>이메일</span>
            <input
              autoComplete="email"
              inputMode="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>

          <label className="field">
            <span>비밀번호</span>
            <input
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          <button className="primary-button" type="submit">
            로그인
          </button>
        </form>

        {message ? <p className="error-message">{message}</p> : null}
      </section>
    </main>
  );
}
