"use client";

import { useState } from "react";
import Link from "next/link";

import { useAuthSession } from "@/components/auth/AuthGate";
import BottomNavigation from "@/components/common/bottomNavigation/BottomNavigation";
import Button from "@/components/common/button/Button";
import ConfirmModal from "@/components/common/confirmModal/ConfirmModal";

import { MdChevronRight } from "react-icons/md";

import styles from "./settingsPageClient.module.scss";

const SIGN_OUT_ERROR_MESSAGE = "로그아웃하지 못했습니다. 다시 시도해 주세요.";

export function SettingsPageClient() {
  const { email, signOut } = useAuthSession();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");

  function handleOpenLogoutModal() {
    setSignOutError("");
    setIsLogoutModalOpen(true);
  }

  function handleCloseLogoutModal() {
    if (isSigningOut) {
      return;
    }

    setIsLogoutModalOpen(false);
    setSignOutError("");
  }

  async function handleConfirmLogout() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    setSignOutError("");

    try {
      await signOut();
    } catch {
      setSignOutError(SIGN_OUT_ERROR_MESSAGE);
      setIsSigningOut(false);
    }
  }

  return (
    <main className={styles["settings-page-content"]} aria-label="설정 화면">
      <header className={styles["page-title-box"]}>
        <h1>설정</h1>
      </header>

      <div className={styles["settings-content"]}>
        <section
          className={styles["record-settings-section"]}
          aria-labelledby="record-settings-section-title"
        >
          <h2 id="record-settings-section-title">기록 설정</h2>
          <Link href="/settings/food-recommendations">
            <span>음식 추천 목록</span>
            <MdChevronRight aria-hidden="true" />
          </Link>
        </section>

        <section
          className={styles["account-section"]}
          aria-labelledby="account-section-title"
        >
          <h2 id="account-section-title">계정</h2>
          <dl className={styles["account-details"]}>
            <div>
              <dt>로그인 계정</dt>
              <dd>{email}</dd>
            </div>
          </dl>
        </section>

        <div className={styles["logout-action"]}>
          <Button
            color="danger"
            fill="outline"
            size="large"
            isFullWidth
            onClick={handleOpenLogoutModal}
          >
            로그아웃
          </Button>
        </div>
      </div>

      <BottomNavigation />

      {signOutError ? (
        <p className={styles["error-message"]} role="status">
          {signOutError}
        </p>
      ) : null}

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="로그아웃"
        message="로그아웃할까요?"
        onClose={handleCloseLogoutModal}
        cancelButton={{
          label: "취소",
          onClick: handleCloseLogoutModal,
          isDisabled: isSigningOut,
        }}
        confirmButton={{
          label: "로그아웃",
          color: "danger",
          onClick: handleConfirmLogout,
          isDisabled: isSigningOut,
          isLoading: isSigningOut,
        }}
      />
    </main>
  );
}
