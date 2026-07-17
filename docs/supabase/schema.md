# Supabase 스키마 초안

## 핵심 원칙

- 사용자 소유 데이터는 반드시 `user_id`로 소유자를 표시한다.
- 사용자 소유 테이블에는 RLS를 활성화한다.
- 읽기/쓰기 정책은 `user_id = auth.uid()`를 기준으로 제한한다.
- 허용 계정 여부는 `allowed_users`에서 관리한다.
- 앱은 `is_allowed_user()` RPC로 현재 사용자의 허용 여부만 확인한다.
- 제한된 문자열 값은 Postgres enum 대신 `text + check constraint`로 관리한다.
- 참고 출처는 승인된 것만 AI 리포트 근거로 사용할 수 있다.

## `health_records`

수면, 음식, 화장실, 운동, 컨디션을 발생 이벤트 단위로 저장하는 공통 테이블이다. 날짜별 부모 행이나 category·날짜 단위 unique 제약은 두지 않는다.

v1 컬럼:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null default auth.uid() references auth.users(id) on delete cascade`
- `category text not null`
- `recorded_at timestamptz not null`
- `details jsonb not null default '{}'::jsonb`
- `details_version integer not null default 1`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

제약과 인덱스:

- `category`는 `sleep`, `food`, `toilet`, `exercise`, `condition`만 허용한다.
- `details_version`은 1 이상이어야 한다.
- 최근 기록과 분류별 기록 조회를 위해 `(user_id, recorded_at desc)`, `(user_id, category, recorded_at desc)` 인덱스를 둔다.

시간과 상세값 규칙:

- `recorded_at`은 사용자가 선택한 기기 로컬 날짜·시간을 UTC로 변환한 실제 발생 시각이다.
- `created_at`, `updated_at`은 저장과 수정 시각이며 기록 보기의 날짜 기준으로 사용하지 않는다.
- `details`는 category별 값만 담고, 앱에서는 category별 TypeScript 타입과 변환 함수로 해석한다.
- v1에는 공통 `note` 컬럼을 넣지 않는다.

수면 v1 상세값:

```ts
type TSleepDetailsV1 = {
  event: "slept" | "woke";
};
```

음식 v1 상세값:

```ts
type TFoodDetailsV1 = {
  foods: Array<{
    name: string;
    amount?: string;
  }>;
};
```

- 한 음식 기록은 한 번의 식사 또는 간식 시간에 해당한다.
- `foods`는 한 개 이상의 객체여야 하며 각 객체는 `name`, 선택적 `amount` 키만 허용한다.
- `name`은 공백이 아닌 문자열이어야 한다. `amount`는 `2잔`, `반 그릇`처럼 필요할 때만 적으며, 존재한다면 공백이 아닌 문자열이어야 한다.
- 서로 다른 시간에 먹은 음식은 별도 기록으로 저장해 실제 발생 시각을 보존한다.

운동 v1 상세값:

```ts
type TExerciseDetailsV1 = {
  exercises: Array<{
    name: string;
    amount?: string;
  }>;
};
```

- 한 운동 기록은 한 번의 운동 시간에 해당한다.
- `exercises`는 한 개 이상의 객체여야 하며 각 객체는 `name`, 선택적 `amount` 키만 허용한다.
- `name`은 `산책`, `팔굽혀펴기`처럼 공백이 아닌 문자열이어야 한다.
- `amount`는 `30분`, `20회`처럼 필요할 때만 적으며, 존재한다면 공백이 아닌 문자열이어야 한다.
- 강도, 칼로리, 세트 수는 v1에서 별도 구조화하지 않는다.

컨디션 v1 상세값:

```ts
type TConditionDetailsV1 = {
  note: string;
};
```

- 컨디션은 불편했던 순간을 기록하는 이벤트다. `note`에 두통, 소화 불편, 피로처럼 사용자가 느낀 상태를 자유롭게 남긴다.
- 기록이 없는 시점은 좋은 상태를 뜻하지 않으며, 기록하지 않은 상태로 해석한다.

화장실 v1 상세값:

```ts
type TToiletDetailsV1 = {
  type: "urine" | "bowel" | "both";
  urgency?: "relaxed" | "ordinary" | "urgent";
  wokeFromSleep?: boolean;
  stoolConsistency?: "hard" | "formed" | "loose" | "watery";
  note?: string;
};
```

- `type`은 소변, 대변, 또는 둘 다인 한 번의 이용을 구분한다.
- `urgency`는 급한 정도를, `wokeFromSleep`은 잠에서 깬 뒤의 이용 여부를 기록한다.
- `stoolConsistency`는 `type`이 `bowel` 또는 `both`일 때만 사용한다. 값은 `hard`(단단함), `formed`(형태 있음), `loose`(묽음), `watery`(물처럼 묽음)다.
- `note`는 통증, 평소와 다른 색 변화처럼 드문 특이사항을 짧게 남기는 선택 입력이다.
- 상세 항목은 입력하지 않으면 키를 생략한다. `false`는 사용자가 명시적으로 "아니오"를 선택한 값이며, 미입력과 다르다.
- v1에서는 정의되지 않은 키와 허용되지 않은 값 조합을 DB check constraint로 거부한다.

수정과 삭제 규칙:

- 수정은 `recorded_at`, `details`만 허용하며 `category`는 변경하지 않는다.
- `authenticated` 역할의 UPDATE 권한도 `recorded_at`, `details` 컬럼으로 제한한다.
- 삭제는 `id` 한 건을 대상으로 한다.

레거시 `bathroom_logs` 전환 규칙:

- 이미 적용된 initial migration은 수정하지 않고 원래 정의를 유지한다.
- `20260716235908_migrate_legacy_bathroom_logs.sql`에서 기존 행을 `category = 'toilet'`인 `health_records`로 이전한 뒤 레거시 테이블을 제거한다.
- 기존 UUID, 사용자 소유권, 기록 시각, 생성·수정 시각을 유지한다.
- 동일한 `hard`, `loose` 값은 `stoolConsistency`로 옮기고, 기존 `usual`과 통증·색 변화·출혈 가능성 값은 의미를 바꾸지 않도록 `note`에 남긴다.

RLS 방향:

- 허용된 사용자는 자신의 기록만 조회·생성·수정·삭제할 수 있다.
- 모든 정책은 `is_allowed_user()`와 `(select auth.uid()) = user_id`를 함께 확인한다.
- update 정책은 `USING`과 `WITH CHECK` 모두에서 소유자 조건을 확인한다.

## `allowed_users`

앱 사용이 허용된 이메일을 관리한다.

예상 컬럼:

- `email text primary key`
- `is_active boolean not null default true`
- `created_at timestamptz not null default now()`

사용 방식:

- 앱 로그인 후 현재 사용자 이메일이 이 테이블에 있는지 확인한다.
- `is_active = false`인 이메일은 앱 접근을 차단한다.
- MVP에서는 개발자 또는 Supabase Dashboard에서 직접 관리한다.

RLS 방향:

- 일반 클라이언트는 자신의 이메일 허용 여부만 확인할 수 있어야 한다.
- 임의 사용자가 전체 allowlist를 나열하지 못하게 한다.
- 실제 앱 접근 확인은 `is_allowed_user()` RPC를 사용한다.

## `profiles`

허용된 사용자별 앱 프로필을 저장한다.

예상 컬럼:

- `user_id uuid primary key references auth.users(id) on delete cascade`
- `email text not null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

사용 방식:

- 앱에서 현재 사용자 상태를 확인할 때 사용한다.
- MVP에서는 나이/성별 기반 비교를 하지 않으므로 민감한 프로필 필드는 추가하지 않는다.

RLS 방향:

- 사용자는 자신의 profile만 읽을 수 있다.
- 사용자는 자신의 profile만 수정할 수 있다.

## `reference_sources`

AI 리포트에서 사용할 수 있는 참고 출처 목록이다.

예상 컬럼:

- `id uuid primary key default gen_random_uuid()`
- `title text not null`
- `organization text not null`
- `url text not null`
- `topic text not null`
- `status text not null default 'candidate'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

초기 `status` 후보:

- `approved`
- `candidate`
- `rejected`

사용 방식:

- AI 리포트는 `status = 'approved'`인 출처만 근거로 사용할 수 있다.
- 새 출처 후보는 자동 승인하지 않는다.
- MVP에서는 개발자 관리 방식으로 seed 또는 Dashboard에서 관리한다.
- initial schema migration에는 승인된 기본 출처 seed를 함께 넣는다.

초기 승인 출처:

- Cleveland Clinic: Frequent Urination
- Cleveland Clinic: Constipation
- NHS: Urinary tract infections (UTIs)

## `ai_reports`

리포트 결과를 저장할지 여부는 구현 때 다시 결정한다.

MVP를 단순하게 유지하려면 처음에는 저장하지 않고 요청 시 생성해도 된다. 저장이 필요해지면 다음 컬럼을 고려한다.

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `period text not null`
- `input_start_at timestamptz not null`
- `input_end_at timestamptz not null`
- `content jsonb not null`
- `created_at timestamptz not null default now()`

RLS 방향:

- 사용자는 자신의 리포트만 읽을 수 있다.
- 리포트 생성은 Edge Function을 통해서만 수행한다.

## Initial migration

초기 migration 파일:

- `supabase/migrations/20260702115423_initial_schema.sql`
- `supabase/migrations/20260706100402_fix_auth_policy_advisors.sql`

포함 내용:

- `allowed_users`
- `profiles`
- `reference_sources`
- `is_allowed_user()` RPC
- `updated_at` trigger
- RLS policies
- FK/RLS 조회용 index
- 승인된 참고 출처 seed

`ai_reports`는 MVP 구현을 단순하게 유지하기 위해 initial migration에 포함하지 않는다.

기록 모델 migration은 새 구조를 확정한 뒤 별도로 추가한다.

보정 migration은 Supabase advisors 경고를 반영한다.

- `is_allowed_user()`를 `SECURITY INVOKER`로 낮춘다.
- `auth.jwt()` 호출을 `(select auth.jwt())` 형태로 감싸 RLS initplan 경고를 해소한다.
