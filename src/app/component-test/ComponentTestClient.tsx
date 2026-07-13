"use client";

import { useState } from "react";
import BottomModal from "@/components/common/bottomModal/BottomModal";
import { Button } from "@/components/common/button/Button";
import { ButtonGroup } from "@/components/common/buttonGroup/ButtonGroup";
import { ConfirmModal } from "@/components/common/confirmModal/ConfirmModal";
import { TextInput } from "@/components/common/form/TextInput";
import { Textarea } from "@/components/common/form/Textarea";
import { Tabs } from "@/components/common/tabs/Tabs";

import styles from "./componentTestPage.module.scss";

export function ComponentTestClient() {
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("저녁 이후 물을 적게 마심");
  const [urgency, setUrgency] = useState("ordinary");
  const [wokeFromSleep, setWokeFromSleep] = useState("no");
  const [reportTab, setReportTab] = useState("summary");
  const [isBottomModalOpen, setIsBottomModalOpen] = useState(false);
  const [isPrimaryConfirmOpen, setIsPrimaryConfirmOpen] = useState(false);
  const [isDangerConfirmOpen, setIsDangerConfirmOpen] = useState(false);

  return (
    <main className={styles["component-test-page"]}>
      <div className={styles["app-canvas"]}>
        <header className={styles.topbar}>
          <p className={styles.eyebrow}>Component Test</p>
          <h1>공용 컴포넌트</h1>
          <p className={styles["topbar-description"]}>
            실제 화면 안에서 공용 UI가 어떻게 보이는지 확인합니다.
          </p>
        </header>

        <section className={styles.section} aria-labelledby="button-section-title">
          <h2 id="button-section-title">Button</h2>

          <div className={styles["button-grid"]}>
            <Button color="primary" fill="solid" size="large">
              기본 채움
            </Button>
            <Button color="primary" fill="outline" size="large">
              기본 테두리
            </Button>
            <Button color="primary" fill="soft" size="large">
              기본 연한 배경
            </Button>
            <Button color="primary" fill="ghost" size="large">
              기본 글자형
            </Button>
            <Button color="accent" fill="solid" size="large">
              강조 채움
            </Button>
            <Button color="accent" fill="outline" size="large">
              강조 테두리
            </Button>
            <Button color="accent" fill="soft" size="large">
              강조 연한 배경
            </Button>
            <Button color="accent" fill="ghost" size="large">
              강조 글자형
            </Button>
            <Button color="gray" fill="solid" size="large">
              회색 채움
            </Button>
            <Button color="gray" fill="outline" size="large">
              회색 테두리
            </Button>
            <Button color="gray" fill="soft" size="large">
              회색 연한 배경
            </Button>
            <Button color="gray" fill="ghost" size="large">
              회색 글자형
            </Button>
            <Button color="danger" fill="solid" size="large">
              위험 채움
            </Button>
            <Button color="danger" fill="soft" size="large">
              위험 연한 배경
            </Button>
            <Button color="danger" fill="outline" size="large">
              위험 테두리
            </Button>
            <Button color="danger" fill="ghost" size="large">
              위험 글자형
            </Button>
          </div>

          <div className={styles["button-stack"]}>
            <Button color="primary" size="large" isFullWidth>
              전체 너비 버튼
            </Button>
            <Button color="primary" size="large" isFullWidth isLoading>
              저장 중
            </Button>
            <Button
              color="gray"
              fill="outline"
              size="large"
              isFullWidth
              isDisabled
            >
              비활성 버튼
            </Button>
          </div>

          <div className={styles["size-stack"]}>
            <div className={styles["size-sample"]}>
              <span>작음</span>
              <Button color="accent" size="small" isFullWidth>
                작은 버튼
              </Button>
            </div>
            <div className={styles["size-sample"]}>
              <span>보통</span>
              <Button color="accent" size="medium" isFullWidth>
                보통 버튼
              </Button>
            </div>
            <div className={styles["size-sample"]}>
              <span>큼</span>
              <Button color="accent" size="large" isFullWidth>
                큰 버튼
              </Button>
            </div>
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

        <section className={styles.section} aria-labelledby="tabs-section-title">
          <h2 id="tabs-section-title">Tabs</h2>

          <Tabs
            label="AI 리포트 보기"
            tabs={[
              { value: "summary", label: "요약" },
              { value: "sources", label: "출처" },
              { value: "records", label: "기록 기준" },
            ]}
            value={reportTab}
            onChange={setReportTab}
          />
        </section>

        <section className={styles.section} aria-labelledby="bottom-modal-section-title">
          <h2 id="bottom-modal-section-title">BottomModal</h2>

          <Button
            color="primary"
            size="large"
            isFullWidth
            onClick={() => setIsBottomModalOpen(true)}
          >
            바텀 모달 열기
          </Button>
        </section>

        <section className={styles.section} aria-labelledby="confirm-section-title">
          <h2 id="confirm-section-title">ConfirmModal</h2>

          <div className={styles["button-grid"]}>
            <Button
              color="primary"
              size="large"
              onClick={() => setIsPrimaryConfirmOpen(true)}
            >
              기본 확인
            </Button>
            <Button
              color="danger"
              size="large"
              onClick={() => setIsDangerConfirmOpen(true)}
            >
              삭제 확인
            </Button>
          </div>
        </section>
      </div>

      <BottomModal
        isOpen={isBottomModalOpen}
        onClose={() => setIsBottomModalOpen(false)}
        title="상세 기록"
      >
        <div className={styles["bottom-modal-preview"]}>
          <p>
            저장한 기록에 남길 상세 정보를 이어서 입력하는 상황을 확인합니다.
          </p>

          <div className={styles["bottom-modal-actions"]}>
            <Button
              color="primary"
              size="large"
              isFullWidth
              onClick={() => setIsBottomModalOpen(false)}
            >
              확인
            </Button>
            <Button
              color="gray"
              fill="outline"
              size="large"
              isFullWidth
              onClick={() => setIsBottomModalOpen(false)}
            >
              닫기
            </Button>
          </div>
        </div>
      </BottomModal>

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
          color: "primary",
          onClick: () => setIsPrimaryConfirmOpen(false),
        }}
      />

      <ConfirmModal
        isOpen={isDangerConfirmOpen}
        onClose={() => setIsDangerConfirmOpen(false)}
        title="기록을 삭제할까요?"
        message="삭제한 기록은 되돌릴 수 없습니다."
        cancelButton={{
          label: "닫기",
          onClick: () => setIsDangerConfirmOpen(false),
        }}
        confirmButton={{
          label: "삭제하기",
          color: "danger",
          onClick: () => setIsDangerConfirmOpen(false),
        }}
      />
    </main>
  );
}
