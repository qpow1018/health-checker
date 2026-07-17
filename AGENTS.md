# AGENTS.md

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

## 작업 스킬

- 프론트엔드, route 구조, UI, CSS, TypeScript/React 작업에는 프로젝트 스킬 `$following-health-checker-coding-style`을 적용한다.
- 건강 데이터, Supabase Auth/RLS, `allowed_users`, Edge Function, AI 리포트 작업에는 프로젝트 스킬 `$following-health-checker-data-boundary`를 적용한다.

## 기술 방향

- 화면 본체는 Next.js, React, TypeScript로 만든다.
- 초기 실제 사용은 Vercel에 배포한 PWA를 Android 홈 화면에 설치하는 방식으로 한다.
- React Native WebView shell은 생체인증, 앱 잠금, native push 알림 또는 스토어 배포가 필요해질 때 다시 검토한다.
- 개발 환경에서는 Next.js 화면을 브라우저로 직접 열 수 있어야 한다.

## PWA와 WebView 경계

- 건강 기록 UI와 데이터 흐름은 Next.js 앱이 담당한다.
- PWA는 설치와 standalone 실행만 지원하며 건강 기록과 인증 응답을 오프라인 캐시하지 않는다.
- React Native shell은 native 기능이 필요한 얇은 WebView shell로 유지한다.
- WebView 통신은 생체인증, 앱 잠금, push 알림, 외부 링크 제어처럼 native 기능이 필요한 경우로 제한한다.
- 브라우저와 설치된 PWA에서 다르게 동작할 수 있는 로그인, redirect, safe area, keyboard 처리는 명시적으로 검증한다.
- 추후 WebView를 도입하면 브라우저, PWA, WebView의 동작 차이도 함께 검증한다.

## 문서 규칙

- 장기 유지할 아키텍처, 보안, Supabase 결정만 `docs/`에 둔다.
- 임시 계획, 작업 로그, 구현 중 메모는 완료 후 삭제한다.
- 루트 지침은 간결하게 유지하고, 세부 작업 규칙은 프로젝트 스킬에 둔다.

## 검증

구현 작업에는 가장 작은 의미 있는 검증을 실행한다.

- TypeScript 변경에는 typecheck.
- 데이터 헬퍼, 정책, AI 프롬프트 구성에는 테스트.
- 모바일 주요 흐름이 생긴 뒤에는 수동 smoke check.
- 데이터 접근을 신뢰하기 전에 Supabase 정책 검증.

문서 변경에는 모호함, 모순, 범위 확장을 점검한다.
