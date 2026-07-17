---
name: following-health-checker-data-boundary
description: Use when writing, modifying, reviewing, or refactoring Health Checker data access, Supabase Auth/RLS policies, allowed_users checks, Edge Functions, OpenAI/AI report prompts, health-data storage, secrets, or backend/server boundaries.
---

# Health Checker 데이터 경계

Health Checker의 건강 데이터, 인증, Supabase, Edge Function, AI 리포트 경계를 다룰 때 다음 규칙을 적용한다.

## 기본 원칙

- 건강 기록은 민감한 개인 데이터로 취급한다.
- 인증 없이 개인 기록을 렌더링하거나 반환하지 않는다.
- 공개 회원가입 흐름이나 회원가입 UI를 만들지 않는다.
- 개인 데이터 수집은 최소화한다.
- 명시적인 요청 없이 건강 기록에 대한 새 분석/추적 도구를 추가하지 않는다.
- 제품, 보안, AI, 작업 흐름 결정이 바뀌면 관련 `docs/` 문서도 함께 갱신한다.

## Supabase와 Auth

- Supabase Auth는 이메일 + 비밀번호 로그인을 사용한다.
- 앱 접근은 `allowed_users` 이메일 allowlist로 한 번 더 제한한다.
- 로그인한 사용자라도 `allowed_users`에 없으면 앱 진입과 AI 리포트를 차단한다.
- 사용자 소유 테이블에는 반드시 RLS를 활성화한다.
- 사용자 소유 행은 `user_id = auth.uid()` 기준으로 제한한다.
- 쓰기 정책은 사용자가 행의 소유자를 다른 사용자로 바꾸지 못하게 해야 한다.
- 정책, RPC, helper를 바꿀 때는 `allowed_users`와 row ownership 우회가 없는지 확인한다.

## 서버 경계와 비밀

- 앱에 service role key를 노출하지 않는다.
- OpenAI key를 Next.js 클라이언트, React Native shell, 브라우저 번들에 노출하지 않는다.
- OpenAI 호출은 Supabase Edge Function 또는 다른 서버 측 경계를 통해서만 수행한다.
- React Native shell에 Supabase 기록 로직을 중복 구현하지 않는다.
- WebView localStorage를 건강 데이터의 장기 저장소로 사용하지 않는다. Supabase를 source of truth로 둔다.
- 환경, Supabase client, 서버/인프라 경계는 `src/lib/`에 둔다.
- 새 Supabase 및 Edge Function 호출 wrapper는 `src/api/<domain>/index.ts`에 둔다.
- 새 API 경계 타입은 `src/api/<domain>/type.ts`에 둔다.

## AI 리포트

- AI 리포트는 패턴을 요약한다. 진단하지 않는다.
- 치료, 약물, 응급 처치 지시를 생성하지 않는다.
- 기록이 부족하면 불확실성을 명시한다.
- 기록이 7일 미만이면 개인 기준선을 수집 중이라고 말한다.
- 일반 건강 안내는 승인된 참고 출처만 근거로 사용할 수 있다.
- 출처 링크를 지어내지 않는다.
- 결론처럼 보이는 "정상" 또는 "비정상" 같은 의학적 판단 표현을 피한다.

## 검증

- 데이터 helper, 정책, RPC, AI prompt 구성 변경에는 단위 테스트 또는 정책 검증을 우선 실행한다.
- 데이터 접근을 신뢰하기 전에 Supabase 정책 검증을 수행한다.
- 라우팅, Next.js 설정, 환경 변수, 빌드 동작에 영향이 있으면 `npm run build`를 실행한다.
- 검증을 실행하지 못하면 이유를 명확히 보고한다.
