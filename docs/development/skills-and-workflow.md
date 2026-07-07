# 개발 스킬 및 작업 흐름

## 작업 방식

작고 검증 가능한 단계로 작업한다. 현재 요청을 만족하는 최소 구현을 우선한다.

코딩 전에 다음을 확인한다.

- 가정 명시.
- 애매한 결정 이름 붙이기.
- 범위 좁히기.
- 검증 방법 정의.

## 코드 구조 방향

이 프로젝트는 `loam-client`와 비슷하게 route-local 구조를 기본으로 삼는다.

- `src/app/<route>/`: route와 하단 탭 화면의 소유권.
- `src/app/<route>/<RouteName>Client.tsx`: 상호작용이 필요한 route 최상위 UI.
- `src/app/<route>/_component/`: 해당 route에서만 쓰는 하위 UI.
- `src/app/<route>/_type/`: 해당 route에서만 쓰는 타입.
- `src/app/<route>/_util/`: 해당 route에서만 쓰는 유틸.
- `src/app/<route>/_define/`: 해당 route에서만 쓰는 상수.
- `src/components/<domain>/`: 여러 route에서 재사용하는 도메인 UI.
- `src/components/common/`: 도메인과 무관한 공용 UI.
- `src/hooks/`: React 생명주기에 의존하는 재사용 로직.
- `src/api/`: Supabase 또는 Edge Function 호출 wrapper.
- `src/lib/`: 환경, Supabase client, 서버/인프라 경계.
- `src/types/`: 공용 타입.
- `src/utils/`: 순수 공용 유틸.

`src/features/`는 새 장기 구조로 키우지 않는다. 기존 `features` 파일은 관련 화면이나 탭을 실제로 작업할 때 route-local, `components`, `api`, `types`, `utils`, `lib` 중 맞는 위치로 옮긴다.

현재 큰 탭 방향은 `기록`, `기록 보기`, `AI 리포트`, `설정`이다. 각 탭의 상세 기획은 해당 탭 구현 직전에 좁게 정한다.

인증이 필요한 앱 화면은 `src/app/(app)/` route group 아래에 둔다. `AuthGate`는 `(app)/layout.tsx`에서 한 번만 적용하고, 각 `page.tsx`에서 반복 호출하지 않는다. 로그인 화면은 `src/app/login/`에 둔다.

## 프로젝트 스킬

코드 작성, 수정, 리뷰, 리팩터링에는 `$following-health-checker-coding-style`을 적용한다. 루트 `AGENTS.md`에는 안정적인 운영 지침을 두고, 자세한 코드 배치와 스타일 규칙은 프로젝트 스킬에 둔다.

## 이 프로젝트에서 발전시킬 스킬

### 제품 기획

제품 동작, 화면, AI 리포트 범위를 바꿀 때 사용한다.

필수 산출물:

- 어떤 사용자 문제가 바뀌는가?
- 무엇을 포함하는가?
- 무엇을 제외하는가?
- 성공을 어떻게 검증하는가?

### 건강 데이터 안전 리뷰

기록, 프로필, 참고 출처, AI 리포트, 인증, 데이터베이스 정책을 건드릴 때 사용한다.

필수 확인:

- 필요한 데이터만 수집하는가?
- RLS가 사용자 소유 행을 보호하는가?
- secret이 앱 밖에 있는가?
- AI가 진단과 치료 조언을 피하는가?
- 참고 링크가 사용 전에 승인되었는가?

### Supabase 변경 리뷰

schema, policy, function, seed를 바꿀 때 사용한다.

필수 확인:

- migration이 명시적이고 리뷰 가능하다.
- 노출된 사용자 소유 테이블에 RLS가 활성화되어 있다.
- 정책이 인증 사용자 소유권으로 제한한다.
- Edge Function이 호출자를 검증한다.
- service role은 모바일 앱에서 절대 사용하지 않는다.

### 모바일 UX 리뷰

기록 화면이나 navigation을 바꿀 때 사용한다.

필수 확인:

- 원탭 기록이 빠르게 유지된다.
- 상세 입력은 선택 사항이다.
- 최근 기록을 수정할 수 있다.
- 문구가 명확하고 의학적 진단처럼 보이지 않는다.
- 가장 많이 쓰는 행동이 첫 화면에 남아 있다.

### WebView 경계 리뷰

Next.js 앱과 React Native shell 사이의 책임을 바꿀 때 사용한다.

필수 확인:

- 건강 기록 UI와 데이터 흐름이 Next.js 쪽에 남아 있는가?
- React Native shell이 WebView와 native 기능 연결에 집중하는가?
- WebView 통신이 꼭 필요한 기능으로 제한되는가?
- 브라우저 개발 모드에서도 핵심 화면을 확인할 수 있는가?
- 로그인, redirect, safe area, keyboard 동작을 WebView에서도 따로 확인할 계획이 있는가?

## 기본 검증

코드 변경에는 다음을 우선한다.

- Typecheck.
- 데이터 및 정책 helper 단위 테스트.
- 핵심 UI 동작에 대한 component test.
- Next.js 화면은 브라우저에서 smoke test.
- React Native shell이 생긴 뒤에는 WebView 모바일 수동 smoke test.
- production 데이터 접근을 신뢰하기 전 Supabase policy test.

문서 변경에는 다음을 확인한다.

- 모순이 없는가?
- MVP 범위가 좁게 유지되는가?
- 건강 및 AI 안전 문구가 명확한가?
