"use client";

import { useState } from "react";
import Link from "next/link";

import { useAuthSession } from "@/components/auth/AuthGate";
import BottomNavigation from "@/components/common/bottomNavigation/BottomNavigation";
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
          className={styles["settings-section"]}
          aria-labelledby="record-settings-section-title"
        >
          <h2 id="record-settings-section-title">기록 설정</h2>
          <div className={styles["settings-group"]}>
            <Link
              className={styles["settings-link"]}
              href="/settings/food-recommendations"
              aria-labelledby="food-recommendations-title"
              aria-describedby="food-recommendations-description"
            >
              <span className={styles["setting-copy"]}>
                <span
                  className={styles["setting-title"]}
                  id="food-recommendations-title"
                >
                  음식 추천 목록
                </span>
                <span
                  className={styles["setting-description"]}
                  id="food-recommendations-description"
                >
                  저장된 음식 조합을 확인하고 삭제해요
                </span>
              </span>
              <MdChevronRight aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section
          className={styles["settings-section"]}
          aria-labelledby="account-section-title"
        >
          <h2 id="account-section-title">계정</h2>
          <div className={styles["settings-group"]}>
            <dl className={styles["account-details"]}>
              <div>
                <dt>로그인 계정</dt>
                <dd>{email}</dd>
              </div>
            </dl>
            <button
              className={styles["logout-button"]}
              type="button"
              onClick={handleOpenLogoutModal}
            >
              로그아웃
            </button>
          </div>
        </section>
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
