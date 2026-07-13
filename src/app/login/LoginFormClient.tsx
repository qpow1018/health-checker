"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  checkAllowedUser,
  getCurrentSession,
  signInWithPassword,
  signOut,
} from "@/api/auth";
import { Button } from "@/components/common/button/Button";
import { TextInput } from "@/components/common/form/TextInput";
import styles from "./loginFormClient.module.scss";

type TLoginState = "idle" | "checking-session" | "submitting";

export function LoginFormClient() {
  const router = useRouter();

  const [loginState, setLoginState] = useState<TLoginState>("checking-session");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    async function enterIfAllowed() {
      const session = await getCurrentSession();
      if (ignore) return;

      if (!session) {
        setLoginState("idle");
        return;
      }

      try {
        const isAllowed = await checkAllowedUser();
        if (ignore) return;

        if (isAllowed) {
          router.replace("/record");
          return;
        }

        await signOut();
        setMessage("이 계정은 Health Checker에 접근할 수 없습니다.");
      } catch {
        setMessage("접근 권한을 확인하지 못했습니다.");
      } finally {
        if (!ignore) {
          setLoginState("idle");
        }
      }
    }

    void enterIfAllowed();

    return () => {
      ignore = true;
    };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginState("submitting");
    setMessage("");

    try {
      const session = await signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (!session) {
        setMessage("이메일 또는 비밀번호를 확인해주세요.");
        return;
      }

      const isAllowed = await checkAllowedUser();
      if (isAllowed) {
        router.replace("/record");
        return;
      }

      await signOut();
      setMessage("이 계정은 Health Checker에 접근할 수 없습니다.");
    } catch {
      setMessage("이메일 또는 비밀번호를 확인해주세요.");
    } finally {
      setLoginState("idle");
    }
  }

  const isBusy = loginState !== "idle";
  const isSubmitting = loginState === "submitting";

  return (
    <main className={styles["login-form-client"]}>
      <section className={styles["login-panel"]}>
        <div>
          <p className={styles["eyebrow"]}>Health Checker</p>
          <h1>로그인</h1>
          <p className={styles["description"]}>허용된 계정만 사용할 수 있습니다.</p>
        </div>

        <form className={styles["form"]} onSubmit={handleSubmit}>
          <TextInput
            autoComplete="email"
            id="login-email"
            inputMode="email"
            isDisabled={isBusy}
            isRequired
            label="이메일"
            onChange={setEmail}
            type="email"
            value={email}
          />

          <TextInput
            autoComplete="current-password"
            id="login-password"
            isDisabled={isBusy}
            isRequired
            label="비밀번호"
            onChange={setPassword}
            type="password"
            value={password}
          />

          <Button
            isDisabled={loginState === "checking-session"}
            isFullWidth
            isLoading={isSubmitting}
            size="large"
            type="submit"
            color="primary"
          >
            로그인
          </Button>
        </form>

        {message ? <p className={styles["error-message"]}>{message}</p> : null}
      </section>
    </main>
  );
}
