---
name: following-health-checker-coding-style
description: Use when writing, modifying, reviewing, or refactoring TypeScript, React, Next.js, Supabase, health-record UI, tests, or CSS code in the health-checker repository. Applies the project's route-local structure, shared component boundaries, API/lib/type/util placement, health-data safety, AI safety, WebView boundary, and validation conventions.
---

# Health Checker 코딩 스타일

Health Checker 코드를 작성하거나 수정할 때 다음 규칙을 적용한다.

## 기본 작업 방식

- 먼저 가정, 범위, 검증 방법을 짧게 정리한다.
- 사용자의 요청과 직접 연결되는 파일만 수정한다.
- 새 추상화는 두 번째 사용처가 생기거나 복잡도를 실제로 줄일 때만 만든다.
- 제품, 보안, AI, 작업 흐름 결정이 바뀌면 관련 `docs/` 문서도 함께 갱신한다.

## 파일 배치

- `src/app/<route>/`는 route와 하단 탭 화면의 소유권을 가진다.
- 상호작용이 필요한 route 최상위 UI는 `src/app/<route>/<RouteName>Client.tsx`에 둔다.
- route 전용 하위 UI는 `src/app/<route>/_component/`에 둔다.
- route 전용 타입, 유틸, 상수는 각각 `src/app/<route>/_type/`, `_util/`, `_define/`에 둔다.
- 두 번째 route에서 같은 도메인 컴포넌트가 필요해지면 `src/components/<domain>/`으로 옮긴다.
- 도메인과 무관한 공용 UI는 `src/components/common/`에 둔다.
- React 생명주기에 의존하는 재사용 로직은 `src/hooks/`에 둔다.
- 새 Supabase와 Edge Function 호출 wrapper는 `src/api/<domain>/index.ts`에 둔다.
- 새 API 경계 타입은 `src/api/<domain>/type.ts`에 둔다.
- 환경, Supabase client, 서버/인프라 경계는 `src/lib/`에 둔다.
- 공용 타입은 `src/types/`에 둔다.
- 순수 공용 유틸은 `src/utils/`에 둔다.
- 테스트는 대상 파일 옆에 `*.test.ts` 또는 `*.test.tsx`로 둔다.
- `src/features/`는 새 장기 구조로 키우지 않는다. 기존 파일은 관련 route 작업 때 맞는 위치로 옮긴다.

## TypeScript

- 새 타입은 기본적으로 `type`으로 선언한다.
- 새로 만드는 타입 이름에는 `T` 접두사를 붙인다.
- API 요청 타입은 `TReq`, 응답 타입은 `TRes` 접두사를 사용한다.
- DB row 타입은 이름 끝에 `Row`를 붙인다.
- 타입 전용 import에는 `import type`을 사용한다.
- 상수 데이터에는 필요한 경우 `as const`를 사용한다.
- 모듈 상수는 `UPPER_SNAKE_CASE`로 작성한다.
- `any` 대신 `unknown`과 명시적인 타입 검사를 사용한다.
- 제한된 문자열 값은 union type으로 표현하고, DB check constraint와 값 목록이 어긋나지 않게 유지한다.
- DB row의 `snake_case`를 UI에서 오래 끌고 다니지 말고, 필요한 경계에서 앱이 읽기 쉬운 이름으로 변환한다.

## React와 Next.js

- `page.tsx`는 항상 서버 컴포넌트로 작성하며 `'use client'`를 선언하지 않는다.
- `page.tsx`는 얇게 유지하고 route-level 조립에 집중한다.
- 상호작용이 필요한 페이지 UI는 `<RouteName>Client.tsx`로 분리한다.
- 클라이언트 기능이 필요한 컴포넌트의 진입 파일에만 `'use client'`를 둔다.
- 컴포넌트와 이름 있는 헬퍼 함수는 함수 선언식으로 작성한다.
- 컴포넌트 파일명은 PascalCase를 사용한다.
- boolean 값은 `is...`, 이벤트 props는 `on...`, 이벤트 처리 함수는 `handle...`로 이름을 짓는다.
- 조건이 충족되지 않으면 조기 반환하여 중첩을 줄인다.
- 새 UI 프리미티브를 만들기 전에 `src/components/common/`의 기존 컴포넌트를 확인한다.

## 건강 데이터와 Supabase

- 건강 기록은 민감 데이터로 취급한다.
- 인증 없이 개인 기록을 렌더링하지 않는다.
- 공개 회원가입 UI를 만들지 않는다.
- 사용자 소유 테이블에는 RLS와 `user_id = auth.uid()` 소유권 제한을 전제로 작업한다.
- 쓰기 정책이나 helper를 바꿀 때는 사용자가 행의 소유자를 다른 사용자로 바꿀 수 없는지 확인한다.
- service role key와 OpenAI key를 Next.js 클라이언트, React Native shell, 브라우저 번들에 노출하지 않는다.
- WebView localStorage를 건강 데이터의 장기 저장소로 사용하지 않는다. Supabase를 source of truth로 둔다.

## AI 리포트

- AI는 패턴을 요약하고 진단하지 않는다.
- 치료, 약물, 응급 처치 지시를 생성하지 않는다.
- 기록이 부족하면 불확실성을 명시한다.
- 기록이 7일 미만이면 개인 기준선을 수집 중이라고 말한다.
- 일반 건강 안내는 승인된 참고 출처만 근거로 사용한다.
- 출처 링크를 지어내지 않는다.

## UI와 문구

- 제품 문구는 기본적으로 명확한 한국어를 사용한다.
- "정상", "비정상"처럼 의학적 판단으로 읽히는 표현을 피한다.
- 기록 화면은 앱의 기본 첫 화면이다.
- 빠른 기록은 먼저, 상세 입력은 저장 후 선택 사항으로 둔다.
- 최근 기록은 수정 가능해야 한다.
- 하단 탭은 큰 방향으로 `기록`, `기록 보기`, `AI 리포트`, `설정`을 기준으로 삼고, 각 탭의 상세 기획은 구현 직전에 좁게 정한다.

## CSS

- 전역 스타일은 `src/app/globals.scss`에 둔다. reset, CSS variables, body 기본값처럼 앱 전체에 필요한 것만 둔다.
- 화면/컴포넌트 스타일은 `*.module.scss`로 작성한다.
- SCSS Module 파일명은 소문자로 시작하는 lower camel case를 사용한다. 예: `loginFormClient.module.scss`.
- SCSS Module은 `styles`라는 이름으로 import한다.
- 클래스명은 kebab-case로 작성하고, `styles['class-name']` 형식으로 접근한다.
- class 이름은 역할이 드러나게 작성한다.
- 하위 요소는 컴포넌트의 HTML 구조가 드러나도록 대표 root class 아래에 nesting한다.
- 상태와 modifier는 해당 요소 아래에 nesting한다.
- nesting 깊이는 고정하지 않고 HTML 구조와 가독성에 따라 결정한다.
- 독립적으로 재사용되는 클래스, `@keyframes`, `@mixin`, 전역 스타일만 top-level에 둔다.
- 모바일 WebView에서 safe area, 키보드, 좁은 화면을 고려한다.
- 텍스트가 버튼이나 패널 안에서 넘치지 않도록 stable한 크기와 줄바꿈을 둔다.

## 검증

- TypeScript 변경: `npm run typecheck`.
- React UI 변경: 관련 component test 또는 가장 작은 의미 있는 테스트.
- 데이터 helper, 정책, AI prompt 구성 변경: 단위 테스트 또는 정책 검증.
- 라우팅, Next.js 설정, 환경 변수, 빌드 동작 변경: `npm run build`.
- 검증을 실행하지 못하면 이유를 명확히 보고한다.
