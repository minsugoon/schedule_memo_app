# AUDIT_REPORT — 코드베이스 오류/개선 탐색 보고서

> 기준일: 2026-07-15
> 탐색 범위: `app/_components/`, `app/auth/`, `app/login/`, `lib/hooks/`, `lib/supabase/`, `lib/types.ts`, `lib/dateUtils.ts`, `middleware.ts`
> 본 문서는 코드 수정 없이 탐색만 수행한 결과입니다.

---

## 1. TypeScript 오류 / 타입 불일치

**any 타입 사용**
발견 없음 (`app/`, `lib/` 전체에서 `: any` / `as any` 검색 결과 0건)

**타입 정의 누락 / props 타입 불일치**
발견 없음 — 모든 컴포넌트 props에 interface 정의됨

### [미사용 import]

파일: app/\_components/ItemCard.tsx
위치: 6번째 줄
내용: `import { ..., fmtShortNoPad, ... } from '@/lib/dateUtils'` — `fmtShortNoPad`가 import되어 있으나 파일 내에서 실제로 호출되는 곳이 없음(내부적으로는 `fmtDateLine`이 dateUtils.ts 안에서 자체 사용).
위험도: 🟢 낮음

### [미사용 변수]

파일: app/\_components/ScheduleApp.tsx
위치: 154~155번째 줄
내용: `const workTab = tabs.find(t => t.tab_type === 'work')`, `const allTab = tabs.find(t => t.tab_type === 'all')` — 둘 다 선언 후 파일 내 다른 곳에서 참조되지 않음.
위험도: 🟢 낮음

### [미사용 export 함수]

파일: lib/hooks/useTabs.ts
위치: 126~137번째 줄
내용: `updateTabOrder` 함수가 훅에서 export되지만 코드베이스 어디에서도 호출되지 않음(탭 드래그 정렬 UI 미연결 — PROJECT_SPEC.md에도 이미 "미구현"으로 문서화됨).
위험도: 🟢 낮음

### [미사용 파라미터]

파일: lib/hooks/useSchedules.ts
위치: 41번째 줄
내용: `fetchSchedules(tabId?: string | null)`의 `tabId` 파라미터가 정의되어 있으나, 실제 호출부(`ScheduleApp.tsx` 129, 340번째 줄 등) 4곳 모두 인자 없이 호출함 — 죽은 파라미터.
위험도: 🟢 낮음

---

## 2. 런타임 오류 가능성

### [편집 중 상태가 무관한 데이터 갱신으로 초기화됨]

파일: app/\_components/ItemCard.tsx
위치: 56~67번째 줄 (`useEffect(..., [editing, item])`)
내용: 이 effect는 `item` 객체 참조가 바뀔 때마다 `editDate`/`editTime`/`editDateEnd`/`editTimeEnd`/`editMemo`를 저장된 값으로 되돌린다. 그런데 `ScheduleApp.tsx`의 `items`는 `schedules.map(row => toScheduleItem(row))`(154~156번째 줄 부근)로 매번 **완전히 새 객체**를 생성하며, `useSchedules.ts`의 `toggleDone`/`updateSchedule` 등은 다른 항목을 건드릴 때도 `schedules` 배열 전체를 새 참조로 교체한다(`setSchedules(prev => prev.map(...))`, `fetchSchedules()`). 결과적으로 **카드 A가 편집 모드인 도중 카드 B의 완료 체크박스만 클릭해도** 카드 A의 `item` prop이 새 객체가 되어 이 effect가 재실행되고, 사용자가 입력 중이던 편집 내용이 저장된 원본 값으로 조용히 덮어써진다.
위험도: 🔴 높음

### [Supabase 세션 조회 실패 시 unhandled rejection 가능]

파일: lib/hooks/useAuth.ts
위치: 14~17번째 줄
내용: `supabase.auth.getSession().then(...)`에 `.catch()`가 없음. 네트워크 오류 등으로 Promise가 reject되면 처리되지 않은 rejection이 발생하고 `loading` 상태가 영원히 `true`로 남아 앱이 빈 화면(`<div id="app" />`)에서 멈출 수 있음.
위험도: 🟡 보통

### [저장/수정/삭제 실패 시 사용자 피드백 없음]

파일: app/\_components/ScheduleApp.tsx
위치: 206~311번째 줄 (`handleToggleDone`, `handleDelete`, `handleSaveEdit`, `handleSaveEditWithTime` 전반)
내용: 각 핸들러가 내부적으로 `useSchedules`의 async 함수를 호출하지만, 실패 시(`error` 발생) `useSchedules.ts`는 `console.error`만 남기고 조용히 종료한다. 호출부는 성공을 가정하고 `setEditingId(null)` 등으로 UI를 즉시 전환하므로, DB 저장이 실제로 실패해도 사용자는 알 수 없고 로컬 상태와 서버 상태가 어긋난다.
위험도: 🟡 보통

### [종료일만 입력 시 유효성 검사 우회 + 시작일 자동 대입]

파일: app/\_components/ScheduleApp.tsx
위치: 184~194번째 줄 (`handleAddItem` 내 `startedAt`/`endedAt` 계산)
내용: `dateRaw`가 비어 있고 `dateEndRaw`만 채워진 경우, `lib/dateUtils.ts`의 `validateDateRange`는 `startDate`가 `null`이므로 즉시 `return null`(검사 생략)하고, `ScheduleApp.tsx`는 `startedAt = new Date().toISOString()`(현재 시각)로 자동 대입한다. 사용자가 과거의 종료일만 입력하면 "시작=현재시각, 종료=과거"라는 역전된 범위가 검증 없이 그대로 저장될 수 있음.
위험도: 🟡 보통

**배열 접근 범위 초과**
발견 없음 — `DatePickerModal.tsx`/`TimePickerModal.tsx`의 `Array.from`, `DAYS[idx]` 접근 모두 고정 길이 배열 내에서만 인덱싱됨

---

## 3. Supabase 연동 오류

**tab_type이 아닌 name 기준 탭 탐색 잔존**
발견 없음 — 특수 탭 판별(개인/회사/전체/메모)은 전부 `tab_type` 기준. `useTabs.ts`(`t.name === trimmed`), `TabNameModal.tsx`(`existingNames.includes(item)`)의 이름 비교는 "중복 이름 방지" 용도로, 탭 라우팅 로직과 무관함 — 규칙 위반 아님.

### [schedules.tab_id가 null/고아 상태인 경우 애플리케이션 레벨 처리 없음]

파일: lib/hooks/useTabs.ts
위치: 112~124번째 줄 (`deleteTab`)
내용: 탭 삭제 시 `tabs` 테이블에서 행만 삭제하고, 해당 `tab_id`를 참조하던 `schedules` 행에 대한 명시적 처리(재배정/null 처리)가 코드에 없음. `TabNameModal.tsx`(52번째 줄)의 확인 문구는 "탭의 일정은 삭제되지 않습니다"라고 안내하지만, 실제로는 DB 외래키 설정(ON DELETE 동작)에 전적으로 의존한다. FK가 `RESTRICT`이면 일정이 남아있는 탭은 삭제 자체가 실패하고(콘솔 에러만 남고 조용히 실패), `SET NULL`이 아니라면 고아 `tab_id`를 가진 일정이 "전체" 탭에서는 계속 보이지만 어떤 탭 뱃지도 없이 남게 됨.
위험도: 🟡 보통

### [select/update/delete 쿼리에 user_id 이중 검증 없음 — RLS 전적 의존]

파일: lib/hooks/useTabs.ts (28~31, 99~102, 117번째 줄), lib/hooks/useSchedules.ts (44~51, 87~90, 100번째 줄)
내용: `insert`에는 `user_id: session.user.id`가 명시되지만, `select`/`update`/`delete`는 `.eq('id', ...)` 또는 `.eq('tab_id', ...)`만으로 쿼리하며 코드 레벨에서 `user_id` 필터를 중복 적용하지 않음. RLS 정책이 정상 작동하는 한 문제없지만, RLS 정책이 어긋나거나 우회되는 경우(예: 정책 실수) 다른 사용자의 행에 접근/수정 가능한 여지가 코드만으로는 차단되지 않음. 코드가 아닌 Supabase 대시보드의 RLS 정책 설정을 직접 확인해야 실제 위험도를 판단 가능.
위험도: 🟡 보통 (DB 설정 미확인으로 추정치)

**에러 핸들링 없는 Supabase 쿼리**
발견 없음 — `useAuth.ts`의 `getSession()`(2번 항목에서 별도 지적) 외 모든 Supabase 호출에 `if (error) { console.error(...); return }` 패턴 적용됨

---

## 4. UI / UX 오류

### [position: fixed 사용 — 규칙 위반]

파일: app/\_components/PWAInstallModal.tsx
위치: 11번째 줄
내용: `className="fixed inset-0 z-50 flex items-end justify-center pb-8 px-4"` — 프로젝트의 다른 모든 모달(TabSelectModal, HelpModal, PatchNoteModal, TabNameModal, DatePickerModal, TimePickerModal, DateErrorModal)은 `position: absolute; inset: 0`로 `#app`(430px 고정 폭) 내부에 갇히도록 구현되어 있으나, 이 컴포넌트만 `fixed`를 사용해 브라우저 전체 뷰포트를 덮는다. 데스크톱(431px 이상, `#app`이 중앙 정렬+둥근 모서리 카드로 표시되는 레이아웃)에서 이 모달만 화면 전체를 덮어 시각적으로 어긋남.
(참고: `app/_components/OnboardingOverlay.tsx`도 `position: fixed`를 쓰지만, 이는 이전 스펙에서 "전체 화면 덮기 위한 명시적 예외"로 요청된 것이라 규칙 위반이 아님.)
위험도: 🟡 보통

### [iOS 줌 방지 규칙 위반 — font-size 16px 미만 input]

파일: app/\_components/InputSection.tsx
위치: 111, 131, 161, 181번째 줄
내용: 시작일/종료일/시작시간/종료시간 4개 `<input type="text">`에 `style={{ fontSize: '11px' }}` 인라인 스타일이 적용되어 있음. 프로젝트 전역 CSS(`input[type=text] { font-size: 16px; ... }`)를 인라인 스타일이 덮어써 iOS Safari에서 해당 입력창 포커스 시 자동 확대(줌)가 발생함.
위험도: 🔴 높음

### [iOS 줌 방지 규칙 위반 — 카드 인라인 편집 input]

파일: app/\_components/ItemCard.tsx
위치: 203, 211, 222, 230번째 줄
내용: 카드 인라인 수정 모드의 시작일/종료일/시작시간/종료시간 input 4곳에 동일하게 `style={{ fontSize: '11px' }}` 적용. InputSection.tsx와 동일한 iOS 줌 문제.
위험도: 🔴 높음

### [iOS 줌 방지 규칙 위반 — 탭 이름 입력]

파일: app/\_components/TabNameModal.tsx
위치: 145~159번째 줄
내용: 탭 이름 직접 입력 `<input type="text">`의 인라인 style에 `fontSize: '14px'` — 16px 미만이라 iOS Safari 자동 확대 대상. (InputSection/ItemCard보다 사용 빈도는 낮음.)
위험도: 🟡 보통

### [PWA 정적 자산이 인증 미들웨어에 걸림]

파일: middleware.ts
위치: 41~43번째 줄 (`matcher`)
내용: `matcher: ['/((?!_next/static|_next/image|favicon.ico|auth/callback).*)']` — `/manifest.json`, `/sw.js`, `/workbox-*.js`, `/icon-*.png`, `/apple-touch-icon*.png` 등 PWA 관련 정적 파일 경로가 제외 목록에 없음. 미인증 상태(`/login` 화면)에서 브라우저가 이 파일들을 요청하면 미들웨어가 `/login`으로 리다이렉트시켜, manifest/아이콘이 정상적으로 로드되지 않을 수 있음(로그인 화면에서의 PWA 설치 프롬프트 신뢰성 저하).
위험도: 🟡 보통

**\<form\> 태그 사용**
발견 없음

**console.log 잔존**
발견 없음 (`console.error`만 존재, `console.log` 0건)

---

## 5. 로직 오류

**날짜 유효성 검사 누락 경로**
발견 없음 — `InputSection.tsx`(`handleAdd`)와 `ItemCard.tsx`(`handleSaveClick`) 두 저장 경로 모두 `validateDateRange` 호출을 확인함. (단, 2번 항목에서 지적한 "종료일만 입력" 엣지 케이스는 `validateDateRange` 자체의 설계상 사각지대이며 별도 항목으로 이미 보고함.)

**탭 삭제 시 schedules 처리**
→ 3번 항목에서 보고 완료 (🟡)

**showDone 필터 누락**
발견 없음 — `ItemList.tsx`(57~59번째 줄), `MemoView.tsx`(41~44번째 줄) 모두 `showDone` 적용 확인(이전 작업에서 수정 완료된 상태 유지 중).

### [편집 취소 후 펼침 상태 복원 안 됨]

파일: app/\_components/ItemCard.tsx
위치: 49~52번째 줄(`useEffect(..., [editing])`)
내용: 펼쳐진(`isContentExpanded=true`) 카드에서 인라인 수정 버튼을 눌러 편집을 시작하면 펼침 상태가 `false`로 초기화되는데, 편집을 "취소"해도 펼침 상태가 되돌아오지 않고 접힌 상태로 남음. 데이터 손실은 없는 사소한 UX 불일치.
위험도: 🟢 낮음

### [죽은 클릭-무시 셀렉터]

파일: app/\_components/ItemCard.tsx
위치: 165~169번째 줄 (`handleCardClick`)
내용: `closest('.check-box, .icon-btn, .edit-row, .card-action-inline')` 중 `.icon-btn`, `.edit-row`는 현재 마크업에 존재하지 않는 클래스(과거 아이콘 오버레이 리팩터링 과정에서 제거됨)로, 매칭될 일이 없는 죽은 코드. 실제로는 체크박스/인라인 버튼이 각각 `e.stopPropagation()`을 직접 호출하므로 이 closest() 체크 자체가 사실상 불필요.
위험도: 🟢 낮음

---

## 6. 보안

### [Supabase 에러 메시지 콘솔 노출]

파일: lib/hooks/useTabs.ts, lib/hooks/useSchedules.ts, lib/hooks/useAuth.ts 전반
위치: 각 함수의 `console.error('...', error.message)` 호출부 (예: useTabs.ts 34, 78, 105, 119, 131번째 줄 / useSchedules.ts 55, 79, 92, 102, 115번째 줄)
내용: PostgREST/Supabase 에러 메시지를 브라우저 콘솔에 그대로 출력. 컬럼명·제약조건명 등 스키마 힌트가 노출될 수 있으나, service_role key나 인증 토큰 같은 민감정보 유출은 아님.
위험도: 🟢 낮음

**환경변수 NEXT*PUBLIC* prefix 외 노출**
발견 없음 — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 두 개만 사용, 모두 prefix 준수

**클라이언트 코드에 service_role key 사용**
발견 없음

### [환경변수 non-null assertion(`!`)로 인한 불명확한 실패]

파일: lib/supabase/client.ts (7~8번째 줄), lib/supabase/server.ts (8~9번째 줄), middleware.ts (8~9번째 줄)
내용: `process.env.NEXT_PUBLIC_SUPABASE_URL!` 처럼 TypeScript non-null assertion만으로 처리. 배포 환경에 환경변수가 누락되면 `createBrowserClient`/`createServerClient`가 `undefined`를 받아 원인 파악이 어려운 런타임 에러로 이어질 수 있음(직접적 보안 문제는 아니며 견고성 이슈).
위험도: 🟢 낮음

---

## 7. 성능

### [탭별 카운트 매 렌더마다 비메모이즈드 재계산]

파일: app/\_components/TabBar.tsx
위치: 50~55번째 줄 (`countFor`)
내용: `countFor`가 `useMemo` 없이 정의되어 있고, 각 탭 렌더링마다 `items.filter(...)`를 전체 순회함(탭 수 × 아이템 수). 현재 스코프(개인용 앱)에서는 영향 미미하나, 아이템이 많아지면 매 리렌더마다 불필요한 재계산이 누적됨.
위험도: 🟢 낮음

### [리스트 가상화 미적용]

파일: app/\_components/ItemList.tsx (74~103번째 줄), app/\_components/MemoView.tsx (93~119번째 줄)
내용: `filtered.map(...)`/`sorted.map(...)`으로 전체 항목을 한 번에 DOM에 렌더링. `react-window` 등 가상화 라이브러리 미적용. 소규모 개인 목록 기준으로는 문제없으나 항목 수가 매우 많아지면 렌더링 비용 증가.
위험도: 🟢 낮음

**useEffect/useMemo 의존성 과다**
발견 없음 (2번 항목의 `[editing, item]` 케이스는 "과다"가 아니라 "정상적으로 보이지만 실제로는 부작용을 일으키는" 케이스라 런타임 오류 섹션에 분류함)

---

## 요약 테이블

| 위험도  | 건수 |
| ------- | ---- |
| 🔴 높음 | 3    |
| 🟡 보통 | 8    |
| 🟢 낮음 | 10   |
| 합계    | 21   |

**우선순위 권장**: 🔴 3건(편집 중 데이터 유실 버그, InputSection/ItemCard의 iOS 줌 유발 입력창 8곳) 먼저 조치를 권장합니다. 본 문서는 탐색·보고 목적으로만 작성되었으며 코드 수정은 포함하지 않았습니다.
