# 설정 계정 화면 설계

## 목표

`설정` placeholder를 로그인한 계정 확인과 안전한 로그아웃을 제공하는 첫 번째 설정 화면으로 교체한다.

## 범위

### 포함

- 현재 로그인 이메일 표시
- 확인 모달을 거친 로그아웃
- 로그아웃 처리 중 중복 실행 방지
- 로그아웃 실패 안내
- `설정`이 활성화된 하단 내비게이션

### 제외

- 알림 설정
- 건강 데이터 내보내기·삭제
- 비밀번호 변경
- 회원가입과 계정 생성
- 앱 정보와 버전 표시
- WebView 또는 native 설정

## 검토한 접근 방식

1. route 전용 `SettingsPageClient`가 `useAuthSession()`을 사용
   - 인증 상태와 redirect 로직을 재사용하면서 설정 화면의 책임을 route 안에 유지한다.
   - 이 방식을 채택한다.
2. 공용 `AccountPanel` 컴포넌트 추출
   - 두 번째 사용처가 없어 현재 범위에는 불필요한 추상화다.
3. 설정 화면이 인증 API를 직접 호출
   - `AuthGate`의 세션 정리와 redirect 동작을 중복하므로 사용하지 않는다.

## 화면 구조

`page.tsx`는 서버 컴포넌트로 유지하고 상호작용은 route-root `SettingsPageClient.tsx`가 담당한다.

화면은 기존 앱 canvas와 하단 내비게이션 구조를 따른다.

- 상단: eyebrow `설정`, 제목 `계정과 앱 설정`
- 계정 영역: label `로그인 계정`, 현재 이메일
- 로그아웃 영역: 간단한 설명과 destructive 스타일 `로그아웃` 버튼
- 하단: `BottomNavigation activeHref="/settings"`

알림·데이터 관리처럼 아직 구현하지 않는 항목은 비활성 메뉴나 준비 중 문구로 노출하지 않는다.

## 로그아웃 흐름

1. 사용자가 `로그아웃` 버튼을 누른다.
2. 공용 `ConfirmModal`을 열어 제목 `로그아웃`, 메시지 `로그아웃할까요?`를 표시한다.
3. `취소`는 모달만 닫는다.
4. 확인 버튼은 `useAuthSession().signOut()`을 한 번 호출한다.
5. 처리 중에는 취소·확인 버튼을 비활성화해 중복 실행을 막는다.
6. 성공하면 `AuthGate`의 기존 동작이 세션을 정리하고 `/login`으로 이동한다.
7. 실패하면 모달을 닫지 않고 `로그아웃하지 못했습니다. 다시 시도해 주세요.`를 화면에 표시한다.

설정 화면은 Supabase 클라이언트나 인증 API를 직접 호출하지 않는다.

## 상태와 오류 처리

- 이메일은 `AuthGate`가 허용한 세션 컨텍스트에서만 읽는다.
- `AuthGate` 밖에서 화면이 렌더링되는 흐름은 지원하지 않는다.
- 로그아웃 실패 메시지는 `role="status"`로 알린다.
- 실패 후 사용자는 모달을 닫거나 로그아웃을 다시 시도할 수 있다.
- 로그아웃 성공 후 별도 성공 메시지는 표시하지 않는다. 로그인 화면 이동이 완료 상태다.

## 파일 경계

- `src/app/(app)/settings/page.tsx`: `SettingsPageClient` 조립만 담당
- `src/app/(app)/settings/SettingsPageClient.tsx`: 계정 표시, 모달, 로그아웃 상태
- `src/app/(app)/settings/SettingsPageClient.test.tsx`: 사용자 흐름 검증
- `src/app/(app)/settings/settingsPageClient.module.scss`: 설정 route 전용 모바일 스타일
- 기존 `AuthGate`, `Button`, `ConfirmModal`, `BottomNavigation`: 수정 없이 재사용

기존 placeholder용 `settingsPage.module.scss`는 새 클라이언트 스타일로 대체한다.

## 검증

- 로그인 이메일이 표시되는지 확인한다.
- `설정` 하단 탭이 현재 페이지로 표시되는지 확인한다.
- 로그아웃 버튼을 누르면 확인 모달이 열리는지 확인한다.
- 취소 시 `signOut`이 호출되지 않는지 확인한다.
- 확인 시 `signOut`이 한 번만 호출되는지 확인한다.
- 처리 중 버튼이 비활성화되는지 확인한다.
- 실패 시 안내가 표시되고 재시도할 수 있는지 확인한다.
- 관련 컴포넌트 테스트와 `npm run typecheck`, `npm run lint`를 실행한다.

