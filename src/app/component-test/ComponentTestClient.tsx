"use client";

import { useState } from "react";
import { Button } from "@/components/common/button/Button";
import { ButtonGroup } from "@/components/common/buttonGroup/ButtonGroup";
import { ConfirmModal } from "@/components/common/confirmModal/ConfirmModal";
import { TextInput } from "@/components/common/form/TextInput";
import { Textarea } from "@/components/common/form/Textarea";

import styles from "./componentTestPage.module.scss";

export function ComponentTestClient() {
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("저녁 이후 물을 적게 마심");
  const [urgency, setUrgency] = useState("ordinary");
  const [wokeFromSleep, setWokeFromSleep] = useState("no");
  const [isPrimaryConfirmOpen, setIsPrimaryConfirmOpen] = useState(false);
  const [isDestructiveConfirmOpen, setIsDestructiveConfirmOpen] = useState(false);

  return (
    <main className={styles["component-test-page"]}>
      <section className={styles.surface}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Component Test</p>
          <h1>공용 컴포넌트</h1>
        </header>

        <section className={styles.section} aria-labelledby="button-section-title">
          <h2 id="button-section-title">Button</h2>

          <div className={styles["button-grid"]}>
            <Button variant="primary" appearance="solid" size="large">
              Primary Solid
            </Button>
            <Button variant="primary" appearance="outline" size="large">
              Primary Outline
            </Button>
            <Button variant="secondary" appearance="solid" size="large">
              Secondary Solid
            </Button>
            <Button variant="secondary" appearance="outline" size="large">
              Secondary Outline
            </Button>
            <Button variant="secondary" appearance="soft" size="large">
              Secondary Soft
            </Button>
            <Button variant="secondary" appearance="ghost" size="large">
              Secondary Ghost
            </Button>
            <Button variant="destructive" appearance="soft" size="large">
              Destructive Soft
            </Button>
            <Button variant="destructive" appearance="outline" size="large">
              Destructive Outline
            </Button>
          </div>

          <div className={styles["button-stack"]}>
            <Button variant="primary" size="large" isFullWidth>
              전체 너비 버튼
            </Button>
            <Button variant="primary" size="large" isFullWidth isLoading>
              저장 중
            </Button>
            <Button
              variant="secondary"
              appearance="outline"
              size="large"
              isFullWidth
              isDisabled
            >
              비활성 버튼
            </Button>
          </div>

          <div className={styles["size-row"]}>
            <Button variant="secondary" size="small">
              Small
            </Button>
            <Button variant="secondary" size="medium">
              Medium
            </Button>
            <Button variant="secondary" size="large">
              Large
            </Button>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="form-section-title">
          <h2 id="form-section-title">Form</h2>

          <div className={styles["form-stack"]}>
            <TextInput
              autoComplete="email"
              helperText="허용된 계정 이메일을 입력하세요."
              id="component-test-email"
              inputMode="email"
              label="이메일"
              onChange={setEmail}
              placeholder="name@example.com"
              type="email"
              value={email}
            />

            <TextInput
              errorMessage="비밀번호를 다시 확인해주세요."
              id="component-test-password"
              label="비밀번호"
              onChange={() => undefined}
              type="password"
              value="wrong-password"
            />

            <Textarea
              helperText="상세 기록에 남길 내용을 짧게 적어주세요."
              id="component-test-note"
              label="메모"
              onChange={setNote}
              rows={4}
              value={note}
            />
          </div>
        </section>

        <section className={styles.section} aria-labelledby="button-group-section-title">
          <h2 id="button-group-section-title">ButtonGroup</h2>

          <div className={styles["form-stack"]}>
            <ButtonGroup
              label="긴급도"
              options={[
                { value: "relaxed", label: "여유" },
                { value: "ordinary", label: "보통" },
                { value: "urgent", label: "급함" },
              ]}
              value={urgency}
              onChange={setUrgency}
            />
            <ButtonGroup
              label="자다가 깼음"
              options={[
                { value: "yes", label: "예" },
                { value: "no", label: "아니오" },
              ]}
              value={wokeFromSleep}
              onChange={setWokeFromSleep}
            />
            <ButtonGroup
              isDisabled
              label="비활성 선택"
              options={[
                { value: "yes", label: "예" },
                { value: "no", label: "아니오" },
              ]}
              value="yes"
              onChange={() => undefined}
            />
          </div>
        </section>

        <section className={styles.section} aria-labelledby="confirm-section-title">
          <h2 id="confirm-section-title">ConfirmModal</h2>

          <div className={styles["button-grid"]}>
            <Button
              variant="primary"
              size="large"
              onClick={() => setIsPrimaryConfirmOpen(true)}
            >
              기본 확인
            </Button>
            <Button
              variant="destructive"
              size="large"
              onClick={() => setIsDestructiveConfirmOpen(true)}
            >
              삭제 확인
            </Button>
          </div>
        </section>
      </section>

      <ConfirmModal
        isOpen={isPrimaryConfirmOpen}
        onClose={() => setIsPrimaryConfirmOpen(false)}
        title="상세를 저장할까요?"
        message="입력한 상세 정보가 방금 저장한 기록에 추가됩니다."
        cancelButton={{
          label: "닫기",
          onClick: () => setIsPrimaryConfirmOpen(false),
        }}
        confirmButton={{
          label: "저장하기",
          variant: "primary",
          onClick: () => setIsPrimaryConfirmOpen(false),
        }}
      />

      <ConfirmModal
        isOpen={isDestructiveConfirmOpen}
        onClose={() => setIsDestructiveConfirmOpen(false)}
        title="기록을 삭제할까요?"
        message="삭제한 기록은 되돌릴 수 없습니다."
        cancelButton={{
          label: "닫기",
          onClick: () => setIsDestructiveConfirmOpen(false),
        }}
        confirmButton={{
          label: "삭제하기",
          variant: "destructive",
          onClick: () => setIsDestructiveConfirmOpen(false),
        }}
      />
    </main>
  );
}
