# Supabase 스키마 초안

## 핵심 원칙

- 사용자 소유 데이터는 반드시 `user_id`로 소유자를 표시한다.
- 사용자 소유 테이블에는 RLS를 활성화한다.
- 읽기/쓰기 정책은 `user_id = auth.uid()`를 기준으로 제한한다.
- 허용 계정 여부는 `allowed_users`에서 관리한다.
- 참고 출처는 승인된 것만 AI 리포트 근거로 사용할 수 있다.

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

소변/대변 기록의 source of truth다.

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

