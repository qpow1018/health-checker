"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import {
  checkAllowedUser,
  getCurrentSession,
  signOut as signOutFromApi,
  subscribeToAuthChanges,
} from "@/api/auth";
import styles from "./authGate.module.scss";

type TAuthGateProps = {
  children: React.ReactNode;
};

type TAuthState = "loading" | "checking-access" | "allowed" | "blocked";

type TAuthSessionContextValue = {
  email: string;
  signOut: () => Promise<void>;
};

const AuthSessionContext = createContext<TAuthSessionContextValue | null>(null);

export function AuthGate({ children }: TAuthGateProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState<TAuthState>("loading");
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let ignore = false;

    async function allowSession(nextSession: Session | null) {
      if (!nextSession) {
        queryClient.clear();
        setSession(null);
        setAuthState("blocked");
        if (pathname !== "/login") {
          router.replace("/login");
        }
        return;
      }

      setAuthState((currentAuthState) =>
        currentAuthState === "allowed" ? currentAuthState : "checking-access",
      );

      try {
        const isAllowed = await checkAllowedUser();
        if (ignore) return;

        if (isAllowed) {
          setSession(nextSession);
          setAuthState("allowed");
          return;
        }

        await signOutFromApi();
        queryClient.clear();
        setSession(null);
        setAuthState("blocked");
        router.replace("/login");
      } catch {
        if (ignore) return;
        setSession(null);
        setAuthState("blocked");
        router.replace("/login");
      }
    }

    async function restoreSession() {
      const restoredSession = await getCurrentSession();
      if (ignore) return;

      await allowSession(restoredSession);
    }

    const { data: listener } = subscribeToAuthChanges((event, nextSession) => {
      if (event === "INITIAL_SESSION") {
        return;
      }

      void allowSession(nextSession);
    });

    void restoreSession();

    return () => {
      ignore = true;
      listener.subscription.unsubscribe();
    };
  }, [pathname, queryClient, router]);

  const contextValue = useMemo<TAuthSessionContextValue | null>(() => {
    if (authState !== "allowed" || !session?.user.email) {
      return null;
    }

    return {
      email: session.user.email,
      signOut: async () => {
        await signOutFromApi();
        queryClient.clear();
        setSession(null);
        setAuthState("blocked");
        router.replace("/login");
      },
    };
  }, [authState, queryClient, router, session]);

  if (authState === "loading" || authState === "checking-access") {
    return (
      <main className={styles["auth-gate"]}>
        <section className={styles["surface"]}>
          <p className={styles["eyebrow"]}>Health Checker</p>
          <h1>확인 중</h1>
          <p className={styles["muted"]}>계정 접근 권한을 확인하고 있습니다.</p>
        </section>
      </main>
    );
  }

  if (!contextValue) {
    return null;
  }

  return (
    <AuthSessionContext.Provider value={contextValue}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error("useAuthSession must be used inside AuthGate.");
  }

  return context;
}
