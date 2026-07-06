# AGENTS.md

이 저장소에서 작업할 때 따르는 지침입니다.

## 핵심 원칙

- 구현 전에 가정을 명시한다.
- 요구사항이 애매하면 질문한다.
- 변경은 작게 유지하고 사용자의 요청과 직접 연결한다.
- 추측성 추상화보다 단순한 코드를 우선한다.
- 완료라고 말하기 전에 검증한다.

## 명령어

저장소 루트에서 실행한다.

```bash
npm run dev
npm run lint
npm run test
npm run typecheck
npm run build
```

일반적인 TypeScript/React 변경 후에는 `npm run typecheck`와 관련 테스트를 우선 실행한다. 라우팅, Next.js 설정, 환경 변수, 빌드 동작에 영향이 있으면 `npm run build`를 실행한다.

## 수정 제외 경로

명시적인 요청이 없다면 다음 파일과 디렉터리를 수정하지 않는다.

- `node_modules/`
- `.next/`
- `next-env.d.ts`
- `tsconfig.tsbuildinfo`
- `.env.local`
- `supabase/.temp/`

## 코딩 스타일

코드 작성, 수정, 리뷰, 리팩터링에는 프로젝트 스킬 `$following-health-checker-coding-style`을 적용한다.

## 제품 범위

이 프로젝트는 화장실 패턴을 기록하는 개인 모바일 앱이다.

현재 기술 방향:

- 화면 본체는 Next.js, React, TypeScript로 만든다.
- 실제 사용은 React Native WebView shell 안에서 한다.
- 개발 환경에서는 Next.js 화면을 브라우저로 직접 열 수 있어야 한다.
- React Native shell은 얇게 유지하고 WebView/native 기능만 담당한다.

MVP에서 기록하는 것:

- 소변 기록.
- 대변 기록.
- 소변과 대변을 모두 포함한 기록.
- 빠른 기록 후 선택적으로 추가하는 상세 정보.
- 개인 기록과 승인된 출처를 바탕으로 한 AI 리포트.

명시적인 요청 없이 이 제품을 범용 건강 플랫폼으로 확장하지 않는다.

## 건강 데이터 규칙

- 모든 기록은 민감한 건강 데이터로 취급한다.
- 인증 없이 개인 기록을 노출하지 않는다.
- 명시적인 요청 없이 공개 회원가입 흐름을 추가하지 않는다.
- 앱에는 회원가입 UI를 만들지 않는다.
- Supabase Auth는 이메일 + 비밀번호 로그인을 사용한다.
- 앱 접근은 `allowed_users` 이메일 allowlist로 한 번 더 제한한다.
- 개인 데이터 수집은 최소화한다.
- 명시적인 요청 없이 건강 기록에 대한 분석/추적 도구를 추가하지 않는다.

## Supabase 규칙

- 사용자 소유 테이블에는 반드시 RLS를 활성화한다.
- 사용자 소유 행은 `user_id = auth.uid()` 기준으로 제한한다.
- 로그인한 사용자라도 `allowed_users`에 없으면 앱 진입과 AI 리포트를 차단한다.
- 쓰기 정책은 사용자가 행의 소유자를 다른 사용자로 바꾸지 못하게 해야 한다.
- 앱에 service role key를 노출하지 않는다.
- OpenAI 호출은 Supabase Edge Function 또는 다른 서버 측 경계를 통해서만 수행한다.

## AI 안전 규칙

- AI 리포트는 패턴을 요약한다. 진단하지 않는다.
- 치료, 약물, 응급 처치 지시를 생성하지 않는다.
- 기록이 부족하면 불확실성을 명시한다.
- 기록이 7일 미만이면 개인 기준선을 수집 중이라고 말한다.
- 일반 건강 안내는 승인된 참고 출처만 근거로 사용할 수 있다.
- 출처 링크를 지어내지 않는다.

## UX 규칙

- 기록 화면이 기본 첫 화면이다.
- 하단 탭은 큰 방향으로 `기록`, `기록 보기`, `AI 리포트`, `설정` 4개를 기준으로 한다.
- 원탭 기록은 항상 빠르게 유지한다.
- 상세 입력은 저장 후 선택 사항이다.
- 최근 기록은 수정할 수 있어야 한다.
- 제품 문구는 기본적으로 명확한 한국어를 사용한다.
- 결론처럼 보이는 "정상" 또는 "비정상" 같은 의학적 판단 표현을 피한다.

## 코드 구조

- `src/app/<route>/`는 route와 탭 화면의 소유권을 가진다.
- route 전용 UI, 타입, 유틸은 각각 `src/app/<route>/_component/`, `_type/`, `_util/`에 둔다.
- 여러 route에서 재사용하는 UI는 `src/components/<domain>/` 또는 `src/components/common/`에 둔다.
- Supabase 및 Edge Function 호출 wrapper는 `src/api/`에 둔다.
- 환경, Supabase client, 서버/인프라 경계는 `src/lib/`에 둔다.
- 공용 타입은 `src/types/`, 순수 유틸은 `src/utils/`에 둔다.
- `src/features/`는 새 장기 구조로 키우지 않는다. 기존 파일은 다음 관련 route 작업 때 위 구조로 옮긴다.

## WebView 경계 규칙

- 건강 기록 UI와 데이터 흐름은 Next.js 앱이 담당한다.
- React Native shell에 Supabase 기록 로직을 중복 구현하지 않는다.
- WebView 통신은 생체인증, 앱 잠금, push 알림, 외부 링크 제어처럼 native 기능이 필요한 경우로 제한한다.
- 브라우저 개발 모드와 WebView 운영 모드가 다르게 동작할 수 있는 로그인, redirect, safe area, keyboard 처리는 명시적으로 검증한다.
- WebView localStorage를 건강 데이터의 장기 저장소로 사용하지 않는다. Supabase를 source of truth로 둔다.

## 문서 규칙

- 제품, 보안, AI, 작업 흐름 결정이 바뀌면 문서도 함께 갱신한다.
- 저장소 지침은 간결하게 유지한다.
- 자세한 절차는 `docs/` 아래에 둔다.

## 검증

구현 작업에는 가장 작은 의미 있는 검증을 실행한다.

- TypeScript 변경에는 typecheck.
- 데이터 헬퍼, 정책, AI 프롬프트 구성에는 테스트.
- 모바일 주요 흐름이 생긴 뒤에는 수동 smoke check.
- 데이터 접근을 신뢰하기 전에 Supabase 정책 검증.

문서 변경에는 모호함, 모순, 범위 확장을 점검한다.
