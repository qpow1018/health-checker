import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import QueryProvider from "@/components/QueryProvider";

import ExercisePageClient from "./ExercisePageClient";

const routerMocks = vi.hoisted(() => ({
  back: vi.fn(),
  editId: "",
}));
const healthRecordMocks = vi.hoisted(() => ({
  createExerciseRecord: vi.fn(),
  getHealthRecord: vi.fn(),
  updateHealthRecord: vi.fn(),
}));
const toastMocks = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/record/exercise",
  useSearchParams: () =>
    new URLSearchParams(routerMocks.editId ? `edit=${routerMocks.editId}` : ""),
  useRouter: () => ({
    back: routerMocks.back,
  }),
}));

vi.mock("@/api/healthRecords", () => ({
  createExerciseRecord: healthRecordMocks.createExerciseRecord,
  getHealthRecord: healthRecordMocks.getHealthRecord,
  updateHealthRecord: healthRecordMocks.updateHealthRecord,
}));

vi.mock("@/utils/toast", () => ({
  default: {
    error: toastMocks.error,
    success: toastMocks.success,
  },
}));

describe("ExercisePageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    routerMocks.editId = "";
  });

  test("shows the exercise record form", () => {
    render(
      <QueryProvider>
        <ExercisePageClient />
      </QueryProvider>,
    );

    expect(screen.getByRole("main", { name: "운동 기록 화면" })).toBeInTheDocument();
    expect(screen.getByLabelText("날짜")).toBeInTheDocument();
    expect(screen.getByLabelText("시간")).toBeInTheDocument();
    expect(screen.getByLabelText("운동 이름")).toBeInTheDocument();
    expect(screen.getByLabelText("운동량")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "저장" })).toBeDisabled();
  });

  test("adds and removes an exercise input", async () => {
    const user = userEvent.setup();
    render(
      <QueryProvider>
        <ExercisePageClient />
      </QueryProvider>,
    );

    await user.click(screen.getByRole("button", { name: "운동 추가" }));

    expect(screen.getAllByLabelText("운동 이름")).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "운동 삭제" })).toHaveLength(2);

    await user.click(screen.getAllByRole("button", { name: "운동 삭제" })[1]);

    expect(screen.getAllByLabelText("운동 이름")).toHaveLength(1);
  });

  test("saves the entered exercise items", async () => {
    const user = userEvent.setup();
    healthRecordMocks.createExerciseRecord.mockResolvedValue({ id: "record-5" });
    render(
      <QueryProvider>
        <ExercisePageClient />
      </QueryProvider>,
    );

    await selectTime(user);
    await user.type(screen.getByLabelText("운동 이름"), "산책");
    await user.type(screen.getByLabelText("운동량"), "30분");
    await user.click(screen.getByRole("button", { name: "운동 추가" }));
    await user.type(screen.getAllByLabelText("운동 이름")[1], "팔굽혀펴기");
    await user.type(screen.getAllByLabelText("운동량")[1], "20회");
    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(healthRecordMocks.createExerciseRecord).toHaveBeenCalledWith({
      date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      time: "19:30",
      exercises: [
        { name: "산책", amount: "30분" },
        { name: "팔굽혀펴기", amount: "20회" },
      ],
    });
    expect(toastMocks.success).toHaveBeenCalledWith("기록을 저장했습니다.");
    expect(routerMocks.back).toHaveBeenCalled();
  });

  test("shows an error toast when saving fails", async () => {
    const user = userEvent.setup();
    healthRecordMocks.createExerciseRecord.mockRejectedValue(new Error("save failed"));
    render(
      <QueryProvider>
        <ExercisePageClient />
      </QueryProvider>,
    );

    await selectTime(user);
    await user.type(screen.getByLabelText("운동 이름"), "산책");
    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => {
      expect(toastMocks.error).toHaveBeenCalledWith(
        "운동 기록을 저장하지 못했습니다. 다시 시도해 주세요.",
      );
    });
    expect(
      screen.queryByText("운동 기록을 저장하지 못했습니다. 다시 시도해 주세요."),
    ).not.toBeInTheDocument();
  });

  test("keeps the form hidden while an existing record is loading", () => {
    routerMocks.editId = "record-5";
    healthRecordMocks.getHealthRecord.mockReturnValue(new Promise(() => {}));

    render(
      <QueryProvider>
        <ExercisePageClient />
      </QueryProvider>,
    );

    expect(
      screen.getByRole("main", { name: "운동 기록 수정 화면" }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("운동 이름")).not.toBeInTheDocument();
  });

  test("loads an existing record and saves it through the edit flow", async () => {
    const user = userEvent.setup();
    routerMocks.editId = "record-5";
    healthRecordMocks.getHealthRecord.mockResolvedValue({
      id: "record-5",
      user_id: "user-1",
      category: "exercise",
      recorded_at: "2026-07-16T10:30:00.000Z",
      details: {
        exercises: [
          { name: "산책", amount: "30분" },
          { name: "팔굽혀펴기", amount: "20회" },
        ],
      },
      details_version: 1,
      created_at: "2026-07-16T10:30:00.000Z",
      updated_at: "2026-07-16T10:30:00.000Z",
    });
    healthRecordMocks.updateHealthRecord.mockResolvedValue({ id: "record-5" });

    render(
      <QueryProvider>
        <ExercisePageClient />
      </QueryProvider>,
    );

    expect(
      await screen.findByRole("main", { name: "운동 기록 수정 화면" }),
    ).toBeInTheDocument();
    expect(await screen.findByDisplayValue("산책")).toBeInTheDocument();
    expect(screen.getByDisplayValue("팔굽혀펴기")).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "하단 탭" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "수정 완료" }));

    expect(healthRecordMocks.updateHealthRecord).toHaveBeenCalledWith({
      id: "record-5",
      date: "2026-07-16",
      time: "19:30",
      details: {
        exercises: [
          { name: "산책", amount: "30분" },
          { name: "팔굽혀펴기", amount: "20회" },
        ],
      },
    });
    expect(toastMocks.success).toHaveBeenCalledWith("기록을 수정했습니다.");
    expect(routerMocks.back).toHaveBeenCalled();
  });
});

async function selectTime(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByLabelText("시간"));
  await user.click(screen.getAllByRole("option", { name: "19" })[0]);
  await user.click(screen.getAllByRole("option", { name: "30" })[0]);
  await user.click(screen.getByRole("button", { name: "적용하기" }));
}
