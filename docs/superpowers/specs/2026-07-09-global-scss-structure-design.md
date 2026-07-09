# 전역 SCSS 구조 리팩터링 설계

## 목표

현재 `src/app/globals.scss`가 함께 담당하는 디자인 변수, reset, 앱 전역 스타일을 역할별 파일로 분리한다. 기존 CSS Module의 `var(--...)` 사용은 유지하면서, 새 SCSS에서는 별도 `@use` 없이 `$...` 디자인 변수를 사용할 수 있는 기반을 만든다.

## 범위

- `src/assets/scss/_variables.scss`에 현재 디자인 토큰을 Sass 변수로 정의한다.
- `src/assets/scss/_reset.scss`에는 브라우저 기본 스타일 초기화만 둔다.
- `src/assets/scss/global.scss`에는 CSS custom property 호환 선언과 앱 전역 스타일을 둔다.
- Next.js Sass 설정으로 `_variables.scss`를 모든 SCSS 파일에 자동 주입한다.
- 루트 layout이 새 `global.scss`를 불러오게 한다.

이번 작업에서는 디자인 토큰의 이름과 값을 재설계하지 않는다. 기존 CSS Module의 `var(--...)` 사용처도 `$...`로 변환하지 않는다.

## 파일별 책임

### `_variables.scss`

색상, 크기, 레이어, 그림자, 전환 효과 등 디자인 토큰의 원본 Sass 변수를 정의한다. CSS를 직접 출력하지 않으므로 모든 SCSS 파일에 자동 주입되어도 중복 CSS가 생기지 않는다.

### `_reset.scss`

`box-sizing`, 기본 margin, 폼 요소의 font 상속 등 reset 목적의 규칙만 포함한다. `global.scss`가 한 번 불러온다.

### `global.scss`

`_reset.scss`를 불러오고, 기존 CSS Module과의 하위 호환을 위해 Sass 변수를 `:root` CSS custom property로 노출한다. `body`, focus 표시, `.app-shell`, `.surface`처럼 이 앱 전체에서 의미가 있는 전역 스타일도 담당한다.

## 자동 변수 주입

`next.config.ts`의 `sassOptions.additionalData`에서 다음 선언을 모든 SCSS 파일 앞에 추가한다.

```scss
@use "@/assets/scss/variables" as *;
```

따라서 새 SCSS Module은 별도 import 없이 `$primary` 같은 변수를 사용할 수 있다. `_variables.scss`에는 선언만 있고 CSS 출력은 없으므로 자동 주입에 따른 스타일 중복은 발생하지 않는다.

## 하위 호환

현재 CSS Module은 계속 `var(--primary)` 같은 CSS custom property를 사용한다. `global.scss`가 같은 이름과 값을 제공하므로 이번 리팩터링으로 렌더링 결과는 바뀌지 않는다. 향후 디자인 토큰을 재설계할 때 파일별로 `$primary` 형태로 점진적으로 전환할 수 있다.

## 검증

- `npm run typecheck`로 Next.js 설정의 TypeScript 타입을 확인한다.
- `npm run build`로 자동 주입을 포함한 전체 SCSS 컴파일을 확인한다.
- `git diff --check`로 공백 오류를 확인한다.
