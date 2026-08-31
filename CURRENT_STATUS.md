# CURRENT_STATUS — 코드베이스 현황 보고서

> 작성일: 2026-08-31
> 참고 문서: CLAUDE.md, PROJECT_SPEC.md, SUPABASE_TABLE.md, AUDIT_REPORT.md
> 본 문서는 탐색·보고 목적으로만 작성되었으며 코드 수정은 포함하지 않음
> 참고: `WORK_ROADMAP.md` 파일은 저장소에 존재하지 않음(요청 문구 중 일부에 언급되었으나 실제 파일 확인 결과 없음). AUDIT_REPORT.md 기준으로 보고함.

---

## 1. 구현 완료 상태

### app/_components/ 전체 파일 목록 (16개)
- `AppHeader.tsx` — 헤더(시계, 테마 토글, 새로고침, 로그아웃, 온보딩 버튼)
- `TabBar.tsx` — 동적 탭 바, 완료보기/메모뷰 토글
- `InputSection.tsx` — 일정/메모 입력 폼 (수정 금지 파일)
- `ItemList.tsx` — 필터링·정렬·카드 렌더링 (수정 금지 파일)
- `ItemCard.tsx` — 카드 CRUD·펼치기·인라인 편집
- `MemoView.tsx` — 메모 전용 뷰
- `TabNameModal.tsx` — 탭 추가/이름변경/삭제
- `TabSelectModal.tsx` — 저장 시 탭 선택
- `HelpModal.tsx` — 날짜/시간 입력 도움말
- `PatchNoteModal.tsx` — 패치노트
- `PWAInstallModal.tsx` — PWA 설치 유도
- `OnboardingOverlay.tsx` — 온보딩 스포트라이트
- `DatePickerModal.tsx` — 달력 UI 날짜 선택 (CLAUDE.md 파일 구조 목록에는 없으나 실존, 2026-07-15 추가)
- `TimePickerModal.tsx` — 시간 선택 모달 (CLAUDE.md 목록에 없으나 실존, 2026-07-15 추가)
- `DateErrorModal.tsx` — 날짜 유효성 오류 안내 모달 (CLAUDE.md 목록에 없으나 실존, 2026-07-15 추가)
- `ScheduleApp.tsx` — 루트 상태 관리 허브

> CLAUDE.md의 "파일 구조" 섹션은 `DatePickerModal`/`TimePickerModal`/`DateErrorModal` 3개 파일을 반영하지 못한 상태(문서 갱신 누락).

### lib/hooks/ 전체 파일 목록 (3개)
- `useAuth.ts` — 세션 조회, signOut
- `useSchedules.ts` — schedules CRUD
- `useTabs.ts` — tabs CRUD (`updateTabOrder` 포함, UI 미연결)

### 핵심 기능 구현 여부
| 기능 | 상태 | 근거 |
|---|---|---|
| 탭 관리 (추가/이름변경/삭제, 최대 5개) | ✅ 구현됨 | `TabNameModal.tsx`, `useTabs.ts` |
| 일정 CRUD | ✅ 구현됨 | `useSchedules.ts`, `ScheduleApp.tsx` handleAddItem 등 |
| 메모(날짜 없는 항목) | ✅ 구현됨 | `MemoView.tsx`, `tab_type='memo'` 라우팅 |
| 오늘/진행중 뱃지 | ✅ 구현됨 | `dateUtils.ts`의 `getBadgeInfo` |
| 달력 모달(날짜 선택 UI) | ✅ 구현됨 | `DatePickerModal.tsx` (2026-07-15 추가) |
| 시간 모달(시간 선택 UI) | ✅ 구현됨 | `TimePickerModal.tsx` (2026-07-15 추가) |
| 온보딩 오버레이 | ✅ 구현됨 | `OnboardingOverlay.tsx`, `localStorage 'onboarding_seen_v1'` |
| 날짜 유효성 검사 + 오류 모달 | ✅ 구현됨 | `dateUtils.ts` `validateDateRange`, `DateErrorModal.tsx` (AUDIT_REPORT §2에 엣지 케이스 1건 사각지대 있음) |

---

## 2. AUDIT_REPORT.md 기준 조치 현황

### 조치 완료 (커밋 `d5ee80a`, 2026-07-22)
- 🔴 `ItemCard.tsx` 편집 중 데이터 유실 버그 — `useEffect` 의존성 `[editing, item]` → `[editing]`으로 수정 확인됨
- 🔴 `InputSection.tsx` iOS 자동 확대 버그 — `fontSize: '11px'` 인라인 스타일 제거, `::placeholder` 전용 CSS(`globals.css:168`)로 이전 확인됨. 실제 input(`globals.css:164`)은 `font-size: 16px` 적용 확인됨
- 🔴 `ItemCard.tsx` 카드 인라인 편집 input 동일 버그 — 위와 동일하게 조치 확인됨

### 미조치 (현재도 재확인됨)
- 🟢 `ItemCard.tsx:6` — `fmtShortNoPad` import 됐으나 미사용 (재확인: 파일 내 호출 없음)
- 🟢 `ScheduleApp.tsx:154-155` — `workTab`, `allTab` 선언 후 미사용 (재확인: grep 결과 선언 줄 외 참조 없음)
- 🟢 `useTabs.ts:126-137` — `updateTabOrder` export 됐으나 코드베이스 어디서도 호출 안 됨 (재확인: `.tsx` 전체 검색 결과 0건)
- 🟢 `useSchedules.ts:41` — `fetchSchedules(tabId?)`의 `tabId` 파라미터, 호출부 4곳 모두 인자 없이 호출(죽은 파라미터)
- 🟡 `useAuth.ts:14-17` — `getSession().then(...)`에 `.catch()` 없음. 재확인: 현재도 catch 블록 없음, reject 시 `loading`이 영원히 `true`로 남을 수 있음
- 🟡 `ScheduleApp.tsx` 219~311줄대 — 저장/수정/삭제 실패 시 사용자 피드백 없음(콘솔 로그만)
- 🟡 `ScheduleApp.tsx` handleAddItem — 종료일만 입력 시 유효성 검사 우회 + 시작일에 현재시각 자동 대입되는 엣지 케이스
- 🟡 `useTabs.ts:112-124` (`deleteTab`) — 탭 삭제 시 해당 tab_id를 참조하는 schedules 행 처리가 코드 레벨에 없음(DB FK 설정에 전적 의존)
- 🟡 `useTabs.ts`/`useSchedules.ts` — select/update/delete 쿼리에 `user_id` 이중 검증 없이 RLS에 전적 의존
- 🟡 `PWAInstallModal.tsx:11` — 유일하게 `position: fixed` 사용(다른 모달은 `absolute`), 데스크톱에서 `#app`(430px) 밖 전체 뷰포트를 덮음 (재확인: grep 결과 여전히 유일한 위반)
- 🟡 `TabNameModal.tsx:158` — 탭 이름 입력 input에 `fontSize: '14px'` 인라인 스타일 잔존, 16px 미만이라 iOS 자동 확대 대상 (재확인: 현재도 158번째 줄에 그대로 존재)
- 🟡 `middleware.ts:41-43` — matcher 제외 목록에 `manifest.json`/`sw.js`/`workbox-*`/아이콘류 없음, 미인증 상태에서 PWA 정적 파일 요청 시 `/login`으로 리다이렉트될 수 있음 (재확인: middleware.ts에 해당 경로 예외 없음)
- 🟢 `ItemCard.tsx` — 편집 취소 후 펼침 상태 미복원(사소한 UX 불일치)
- 🟢 `ItemCard.tsx:169-171` — `closest()`에 존재하지 않는 클래스(`.icon-btn`, `.edit-row`) 포함된 죽은 셀렉터
- 🟢 콘솔에 Supabase 에러 메시지(`error.message`) 노출 — 스키마 힌트 노출 가능성(민감정보는 아님)
- 🟢 `client.ts`/`server.ts`/`middleware.ts` — 환경변수 `!` non-null assertion만 사용, 누락 시 불명확한 런타임 에러
- 🟢 `TabBar.tsx:50-55` — `countFor` 비메모이즈드, 매 렌더마다 재계산
- 🟢 `ItemList.tsx`/`MemoView.tsx` — 리스트 가상화 미적용 (재확인: `package.json`에 `react-window` 등 미포함)

**요약**: 총 21건 중 🔴 3건 전부 조치 완료, 🟡 8건·🟢 10건 전부 미조치 — AUDIT_REPORT.md 요약 테이블과 현재 코드 상태 일치.

---

## 3. 코드 현황 요약

- **TODO / FIXME 주석**: `app/` 전체 검색 결과 0건 (발견 없음)
- **console.log 잔존**: 0건
- **console.error 잔존 파일**: `lib/hooks/useTabs.ts`, `lib/hooks/useSchedules.ts` (모두 `if (error) { console.error(...) }` 패턴, `useAuth.ts`는 에러 핸들링 자체가 없어 console.error도 없음)
- **position: fixed 사용 파일**: `app/_components/PWAInstallModal.tsx`(규칙 위반), `app/_components/OnboardingOverlay.tsx`(의도된 예외), `app/globals.css` 내 3곳(1015/1022/1030번째 줄 — 클래스 미확인, 별도 확인 필요)
- **16px 미만 font-size 입력창**: `TabNameModal.tsx:158`의 `<input>`에 `fontSize: '14px'` 잔존(유일). `InputSection.tsx`/`ItemCard.tsx`의 실제 입력 텍스트는 `globals.css:164`의 `font-size: 16px`를 따름(조치 완료 상태)
- **미사용 import/변수**: 위 2번 항목 참고 — `ItemCard.tsx`의 `fmtShortNoPad` import, `ScheduleApp.tsx`의 `workTab`/`allTab` 변수, `useTabs.ts`의 `updateTabOrder` export, `useSchedules.ts`의 `tabId` 파라미터
- **최근 수정 흔적** (git log 기준, 최신순): `ScheduleApp.tsx`(2026-07-14), `InputSection.tsx`/`ItemCard.tsx`(2026-07-22, 버그 수정 커밋), `AUDIT_REPORT.md` 자체는 2026-08-05 갱신. `DatePickerModal.tsx`/`TimePickerModal.tsx`/`DateErrorModal.tsx`는 2026-07-15 신규 추가된 파일

---

## 4. 다음 작업 추천 (우선순위 3개)

1. **`ScheduleApp.tsx` 저장/수정/삭제 실패 시 사용자 피드백 부재 해결** — DB 저장 실패가 조용히 무시되어 로컬-서버 상태가 어긋날 수 있는 🟡 항목 중 사용자 체감 영향이 가장 큼. AUDIT_REPORT.md도 이 항목을 최우선 후보로 명시.
2. **`TabNameModal.tsx:158` iOS 줌 방지 버그 수정** — `InputSection.tsx`/`ItemCard.tsx`에서 이미 같은 패턴으로 해결한 전례가 있어 작업량이 작고, AUDIT_REPORT.md가 "함께 조치 권장"으로 명시한 항목.
3. **`useAuth.ts`의 `getSession()` `.catch()` 누락 보완** — reject 시 앱이 빈 화면에서 영구 정지할 수 있는 잠재적 장애 지점으로, 수정 범위가 작음.

**가장 먼저 시작할 작업 1개**: `TabNameModal.tsx:158`의 iOS 줌 방지 버그 수정. 이유 — 동일 패턴이 InputSection/ItemCard에서 이미 검증된 해결책으로 존재해 위험도가 낮고, 작업 범위가 한 줄 수준으로 명확하며, AUDIT_REPORT.md에서 명시적으로 다음 조치 후보로 지정한 항목이기 때문.
