# Supabase 스키마 초안

## 핵심 원칙

- 사용자 소유 데이터는 반드시 `user_id`로 소유자를 표시한다.
- 사용자 소유 테이블에는 RLS를 활성화한다.
- 읽기/쓰기 정책은 `user_id = auth.uid()`를 기준으로 제한한다.
- 허용 계정 여부는 `allowed_users`에서 관리한다.
- 앱은 `is_allowed_user()` RPC로 현재 사용자의 허용 여부만 확인한다.
- 제한된 문자열 값은 Postgres enum 대신 `text + check constraint`로 관리한다.
- 참고 출처는 승인된 것만 AI 리포트 근거로 사용할 수 있다.

## 새 기록 모델 방향

수정된 기획에서는 수면, 음식, 화장실, 운동, 컨디션 기록을 하나의 공통 기록 테이블에서 시작한다.

초기에는 분류별 상세 테이블을 만들지 않고 `health_records.details jsonb`에 분류별 입력값을 저장한다. 각 분류의 입력 필드는 실제 기록 페이지를 만들면서 확정한다.

초기 분류 값:

- `sleep`
- `food`
- `toilet`
- `exercise`
- `condition`

`details` 운영 원칙:

- `details`는 분류별 입력값만 담는다.
- 공통 조회에 필요한 값은 `health_records`의 일반 컬럼으로 둔다.
- `details_version`으로 분류별 JSON 구조 변경을 추적한다.
- JSON key 이름은 한 번 저장한 뒤 가급적 유지한다.
- 구조를 바꿔야 하면 기존 데이터를 해석할 수 있도록 `details_version`을 올린다.
- 통계, 검색, 제약 조건이 중요해진 분류는 이후 별도 상세 테이블로 분리할 수 있다.

상세 테이블로 분리할 때는 `category`와 `details_version`을 기준으로 기존 JSON 데이터를 변환한다. 예를 들어 `toilet` 상세 테이블이 필요해지면 `health_records`의 `category = 'toilet'` 행만 골라 `details` 값을 새 테이블 컬럼으로 옮긴다.

## `health_records`

새 5분류 기록의 source of truth로 예정된 테이블이다.

예상 컬럼:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `category text not null`
- `recorded_at timestamptz not null default now()`
- `details jsonb not null default '{}'::jsonb`
- `details_version integer not null default 1`
- `note text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

초기 `category` 후보:

- `sleep`
- `food`
- `toilet`
- `exercise`
- `condition`

조회 방식:

- 특정 날짜와 기간 조회는 `recorded_at` 범위 조건으로 처리한다.
- 목록 화면은 공통 컬럼과 `category` 기반 요약을 먼저 보여준다.
- 분류별 전체 상세 내용은 상세 화면 또는 편집 화면에서 `details`를 해석해 보여준다.

RLS 방향:

- 사용자는 자신의 기록만 읽을 수 있다.
- 사용자는 자신의 기록만 만들 수 있다.
- 사용자는 자신의 기록만 수정/삭제할 수 있다.
- update/insert에는 `WITH CHECK ((select auth.uid()) = user_id)`가 필요하다.

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

## `bathroom_logs`

기존 소변/대변 MVP 기록의 source of truth다. 새 5분류 기록 기획으로 전환하면 `health_records`가 장기 기록 테이블이 되고, 이 테이블은 마이그레이션 또는 폐기 대상을 다시 결정한다.

예상 컬럼:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `logged_at timestamptz not null default now()`
- `kind text not null`
- `urgency text`
- `woke_from_sleep boolean`
- `note text`
- `urine_pain boolean`
- `urine_color_unusual boolean`
- `stool_state text`
- `bowel_pain boolean`
- `possible_blood boolean`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

초기 enum 후보:

- `kind`: `urine`, `bowel`, `both`
- `urgency`: `relaxed`, `ordinary`, `urgent`
- `stool_state`: `usual`, `loose`, `hard`

RLS 방향:

- 사용자는 자신의 기록만 읽을 수 있다.
- 사용자는 자신의 기록만 만들 수 있다.
- 사용자는 자신의 기록만 수정/삭제할 수 있다.
- update/insert에는 `WITH CHECK ((select auth.uid()) = user_id)`가 필요하다.

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
- `bathroom_logs`
- `reference_sources`
- `is_allowed_user()` RPC
- `updated_at` trigger
- RLS policies
- FK/RLS 조회용 index
- 승인된 참고 출처 seed

`ai_reports`는 MVP 구현을 단순하게 유지하기 위해 initial migration에 포함하지 않는다.

새 5분류 기록 모델의 `health_records` migration은 아직 포함하지 않는다. 기록 페이지 개편을 시작할 때 `bathroom_logs` 유지, 변환, 대체 범위를 먼저 확정한 뒤 별도 migration으로 추가한다.

보정 migration은 Supabase advisors 경고를 반영한다.

- `is_allowed_user()`를 `SECURITY INVOKER`로 낮춘다.
- `auth.jwt()` 호출을 `(select auth.jwt())` 형태로 감싸 RLS initplan 경고를 해소한다.
