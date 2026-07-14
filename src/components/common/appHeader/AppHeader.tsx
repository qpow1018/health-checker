"use client";

import { useRouter } from "next/navigation";

import { MdArrowBack } from "react-icons/md";

import styles from "./appHeader.module.scss";

export default function AppHeader(props: { title: string }) {
  const { title } = props;

  const router = useRouter();

  function handleClickBackButton() {
    router.back();
  }

  return (
    <header className={styles["app-header"]}>
      <button
        aria-label="뒤로가기"
        className={styles["back-button"]}
        onClick={handleClickBackButton}
      >
        <MdArrowBack aria-hidden="true" />
      </button>

      <h2 className={styles["title"]}>{title}</h2>
    </header>
  );
}
