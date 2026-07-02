# Supabase 설정

## 결정사항

- Supabase Auth는 이메일 + 비밀번호 로그인을 사용한다.
- 앱에는 회원가입 UI를 만들지 않는다.
- 사용자는 Supabase Dashboard에서 직접 생성한다.
- 앱 사용 가능 여부는 `allowed_users` 테이블의 이메일 allowlist로 한 번 더 확인한다.
- 개인 기록은 `user_id = auth.uid()` RLS 정책으로 보호한다.
- OpenAI 호출은 Supabase Edge Function에서만 수행한다.

## 필요한 값

Next.js 앱에서 사용하는 공개 값:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

로컬 CLI 또는 배포 스크립트에서 사용하는 값:

- `SUPABASE_PROJECT_REF`

서버 측에서만 사용하는 secret:

- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

`SUPABASE_SERVICE_ROLE_KEY`와 `OPENAI_API_KEY`는 Next.js public env, React Native shell, 브라우저 번들에 들어가면 안 된다.

## Auth 설정

Supabase Dashboard에서 확인할 것:

- Email provider 활성화.
- 이메일 + 비밀번호 로그인 허용.
- 앱에서는 회원가입 화면을 제공하지 않음.
- 필요한 사용자 계정은 Dashboard에서 직접 생성.

로그인 이후 앱은 다음 순서로 접근을 확인한다.

1. Supabase session이 있는지 확인한다.
2. `allowed_users`에 현재 사용자 이메일이 있고 `is_active = true`인지 확인한다.
3. 허용되지 않은 사용자는 앱 화면과 AI 리포트 접근을 차단한다.
4. 개인 기록 조회/수정은 RLS가 다시 `user_id = auth.uid()`로 제한한다.

## 로컬 환경 파일

`.env.example`을 복사해 로컬 전용 `.env.local`을 만든다.

```bash
cp .env.example .env.local
```

`.env.local`은 커밋하지 않는다.

## Edge Function secret

OpenAI API key와 service role key가 필요한 경우 Supabase Edge Function secret으로 설정한다.

예상 secret:

- `OPENAI_API_KEY`
- 필요한 경우 `SUPABASE_SERVICE_ROLE_KEY`

Edge Function도 우선 사용자의 JWT를 검증해야 한다. service role이 필요하더라도 사용자 검증 없이 데이터에 접근하면 안 된다.

