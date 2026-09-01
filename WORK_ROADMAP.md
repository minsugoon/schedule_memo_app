# WORK_ROADMAP — 전체 작업 스케줄
> 기준일: 2026-09-01
> 참고 문서: CLAUDE.md / PROJECT_SPEC.md / SUPABASE_TABLE.md
> 완료 항목 제거, 미완료 작업만 정리

---

## 현재 상태 요약 (CLAUDE.md "현재 진행 상태" 기준)

| 항목 | 수치 |
|------|------|
| 구현된 컴포넌트 | 19개 (app/_components/) |
| 구현된 훅 | 3개 (lib/hooks/) |
| 🔴 버그 조치 완료 | 3건 (커밋 d5ee80a, 2026-07-22) |
| 🟡 미조치 버그 | 0건 (TabNameModal iOS 줌, useAuth .catch(), 저장 실패 피드백, 종료일만 입력 우회, PWAInstallModal fixed, middleware PWA 경로, 탭 삭제 시 일정 처리, RLS 확인 완료) |
| 🟢 코드 정리 필요 | 0건 (#11~#18 전체 완료) |
| 🆕 신규 기능 대기 | 0건 (스플래시 화면, 로딩 스피너 완료) |
| 예상 총 소요 | #1~#18 전체 완료 — 모든 항목 조치 완료 |
| ⚠️ 확인 필요 | `npm run build` 시 `EISDIR: illegal operation on a directory, readlink 'app/auth/callback/route.ts'` — 코드 변경과 무관한 Windows/webpack 환경 이슈로 추정(#18 참고), 별도 확인 필요 |

### 조치 완료된 버그 (재착수 불필요)
- ✅ ItemCard.tsx — 편집 중 데이터 유실 (useEffect 의존성 수정)
- ✅ InputSection.tsx — iOS 줌 유발 font-size 11px 제거
- ✅ ItemCard.tsx — 수정 모드 iOS 줌 유발 font-size 11px 제거

---

## 전체 작업 순서

---

### 1. 스플래시 화면 🆕 ✅ 완료
**우선순위: 즉시 | 난이도: ★☆☆ | 소요: 30분**

앱 최초 진입 시 로고+앱이름+배경색 화면 표시.
인증 완료 후 페이드아웃.

```
신규: app/_components/SplashScreen.tsx
수정: ScheduleApp.tsx — useAuth loading 상태 연결

구현 스펙:
- 배경: var(--btn-bg)
- 중앙: 📋 아이콘 + "할 일 메모장" 텍스트
- 애니메이션: opacity 1→0 (0.4s) 후 unmount
- 조건: useAuth의 loading=true 동안 표시
- position: fixed 사용 가능 (전체 화면 덮기 위한 예외)
```

---

### 2. 로딩 스피너 🆕 ✅ 완료
**우선순위: 즉시 | 난이도: ★☆☆ | 소요: 30분**

tabs/schedules fetch 중 전체 화면 오버레이 스피너.
스플래시 이후 데이터 준비 전까지 표시.

```
신규: app/_components/LoadingOverlay.tsx
수정: ScheduleApp.tsx — isLoading 상태 연결
수정: globals.css — .loading-spinner keyframes 추가

구현 스펙:
- position: absolute, inset: 0, zIndex: 90
- 반투명 배경 rgba(0,0,0,0.3)
- 중앙: IconLoader2 (@tabler/icons-react) 회전 애니메이션
- 조건: tabs 또는 schedules 로딩 중일 때
```

---

### 3. TabNameModal iOS 줌 수정 🟡 ✅ 완료
**우선순위: 높음 | 난이도: ★☆☆ | 소요: 5분**

CURRENT_STATUS.md에서 "가장 먼저 시작할 작업"으로 지정된 항목.
InputSection/ItemCard에서 이미 검증된 동일 패턴 적용.

```
파일: app/_components/TabNameModal.tsx L158
문제: input에 fontSize: '14px' 인라인 스타일 잔존
수정: fontSize: '14px' → fontSize: '16px'
      placeholder 크기는 globals.css ::placeholder로 처리

globals.css 추가:
.tab-name-input::placeholder { font-size: 12px; }
```

---

### 4. useAuth .catch() 추가 🟡 ✅ 완료
**우선순위: 높음 | 난이도: ★☆☆ | 소요: 10분**

reject 시 loading이 영원히 true로 남아 앱 빈 화면 영구 정지 가능.

```
파일: lib/hooks/useAuth.ts L14
문제: getSession().then(...) 에 .catch() 없음

수정:
supabase.auth.getSession()
  .then(({ data: { session } }) => {
    setSession(session)
    setUser(session?.user ?? null)
  })
  .catch((err) => {
    console.error('세션 조회 실패:', err)
  })
  .finally(() => {
    setLoading(false)
  })
```

---

### 5. 저장/수정/삭제 실패 피드백 🟡 ✅ 완료
**우선순위: 높음 | 난이도: ★★☆ | 소요: 1~2시간**

DB 저장 실패가 조용히 무시되어 로컬-서버 상태 어긋남 가능.
CURRENT_STATUS.md에서 "사용자 체감 영향이 가장 큰 항목"으로 명시.

```
신규: app/_components/ToastMessage.tsx
수정: lib/hooks/useSchedules.ts — 성공/실패 boolean 반환
수정: lib/hooks/useTabs.ts — 동일
수정: ScheduleApp.tsx — 반환값 체크 후 실패 시 토스트 표시

토스트 스펙:
- position: absolute, top: 60px, 중앙 정렬
- 성공: 초록 배경, 2초 후 자동 소멸
- 실패: 빨간 배경, 3초 후 자동 소멸
- zIndex: 80
```

---

### 6. 종료일만 입력 시 검사 우회 수정 🟡 ✅ 완료
**우선순위: 보통 | 난이도: ★★☆ | 소요: 30분**

시작=현재시각, 종료=과거로 역전된 일정 저장 가능한 엣지 케이스.

```
파일: lib/dateUtils.ts — validateDateRange 함수
파일: ScheduleApp.tsx — handleAddItem

수정: dateRaw 비어있고 dateEndRaw 있는 경우
      startedAt 자동 대입 전 종료일 과거 여부 검사 추가
```

---

### 7. PWAInstallModal fixed → absolute 🟡 ✅ 완료
**우선순위: 보통 | 난이도: ★☆☆ | 소요: 10분**

유일한 position: fixed 규칙 위반 파일.
데스크톱에서 #app(430px) 밖 전체 뷰포트를 덮는 문제.

```
파일: app/_components/PWAInstallModal.tsx L11
수정: position: fixed → position: absolute
      다른 모달과 동일한 패턴 적용
```

---

### 8. middleware.ts PWA 경로 제외 🟡 ✅ 완료
**우선순위: 보통 | 난이도: ★☆☆ | 소요: 10분**

미인증 상태에서 PWA 정적 파일 요청 시 /login으로 리다이렉트될 수 있음.

```
파일: middleware.ts L41
수정: matcher 제외 목록에 추가:
/((?!_next/static|_next/image|favicon.ico|
  manifest.json|sw.js|workbox-.*\.js|
  icons/.*|apple-touch-icon.*|
  auth/callback).*)
```

---

### 9. 탭 삭제 시 일정 처리 🟡 ✅ 완료

✅ 완료 — DB FK 확인 결과 ON DELETE SET NULL 설정됨
탭 삭제 시 연결 일정 tab_id 자동 null 처리되므로 코드 수정 불필요.

---

### 10. Supabase RLS 확인 🟡 ✅ 완료

✅ 완료 — 4개 테이블(schedules, tabs, tab_labels, user_settings)
RLS 모두 활성화 확인됨. 코드 수정 불필요.

---

### 11. 코드 정리 일괄 처리 🟢 ✅ 완료
**우선순위: 낮음 | 난이도: ★☆☆ | 소요: 15분**

한 번에 처리:

```
① ItemCard.tsx L6
   미사용 import fmtShortNoPad 제거

② ScheduleApp.tsx L154~155
   미사용 변수 workTab, allTab 제거

③ useTabs.ts L126~137
   미사용 export updateTabOrder 제거 또는 주석 처리

④ useSchedules.ts L41
   미사용 파라미터 tabId 제거
```

---

### 12. ItemCard.tsx 로직 정리 🟢 ✅ 완료
**우선순위: 낮음 | 난이도: ★☆☆ | 소요: 15분**

```
① L49: 편집 취소 후 isContentExpanded = false 초기화 추가
② L169: closest() 셀렉터에서 존재하지 않는
   .icon-btn, .edit-row 제거
```

---

### 13. console.error 정리 🟢 ✅ 완료
**우선순위: 낮음 | 난이도: ★☆☆ | 소요: 10분**

```
파일: lib/hooks/useTabs.ts, lib/hooks/useSchedules.ts
현황: if (error) { console.error(...) } 패턴 잔존
수정: 프로덕션 환경 분기 처리
      if (process.env.NODE_ENV !== 'production') {
        console.error(...)
      }
```

---

### 14. CLAUDE.md 파일 구조 업데이트 🟢 ✅ 완료
**우선순위: 낮음 | 난이도: ★☆☆ | 소요: 5분**

```
CLAUDE.md의 파일 구조 섹션에 누락된 파일 추가 완료:
- app/_components/DatePickerModal.tsx (이전 작업에서 이미 반영)
- app/_components/TimePickerModal.tsx (이전 작업에서 이미 반영)
- app/_components/DateErrorModal.tsx (이전 작업에서 이미 반영)
- app/_components/SplashScreen.tsx (신규 추가)
- app/_components/LoadingOverlay.tsx (신규 추가)
- app/_components/ToastMessage.tsx (신규 추가)

수정 금지 파일 목록에서 middleware.ts 제거
(ROADMAP #8에서 명시적으로 수정 허용·완료됨)
```

---

### 15. useEffect 내 setState 동기 호출 정리 🟢 ✅ 완료
**우선순위: 낮음 | 난이도: ★★☆ | 소요: 30분~1시간**

`eslint-plugin-react-hooks`의 "Calling setState synchronously within an effect can
trigger cascading renders" 에러 6곳을 모두 해소. `npm run lint` 재실행 결과 소스
파일 기준 0 errors(기존 6 errors → 0), `npm run build`도 정상 통과.

```
① app/_components/ScheduleApp.tsx — localStorage 테마 읽어 setTheme/setHydrated
   → theme/hydrated를 useState 지연 초기화 함수로 전환, 해당 useEffect 제거.
   document.documentElement.setAttribute('data-theme', ...)는 layout.tsx의
   플리커 방지 인라인 스크립트가 이미 동일하게 처리하고 있어 중복 제거해도
   기능 손실 없음(코드 확인으로 검증).

② app/_components/ScheduleApp.tsx — 패치노트 최초 노출 여부 setShowPatchNote
   → showPatchNote를 useState 지연 초기화 함수로 전환, 해당 useEffect 제거.
   ①②는 모두 authLoading 게이트(로그인 확인 전엔 빈 셸만 렌더링) 뒤에서만
   실제 UI에 반영되므로 SSR-클라이언트 하이드레이션 불일치 없음(직접 추적 확인).

③ app/_components/TabNameModal.tsx — edit 모드 진입 시 setCustomName
   → useEffect 제거, customName을 useState(mode==='edit' ? currentName ?? '' : '')로
   직접 초기화. app/_components/TabBar.tsx의 <TabNameModal> 렌더에
   key={`${tabNameModal.mode}-${tabNameModal.tabId ?? 'new'}`} 추가해 모드/대상
   탭이 바뀌면 완전히 새 인스턴스로 마운트되도록 보강(스펙 제안은 currentName
   기반 key였으나, 이름이 같은 탭이 생길 가능성을 배제하기 위해 고유한 tabId
   기준으로 변경 — 실제로는 이 모달이 이미 {tabNameModal && <TabNameModal/>}로
   null을 거쳐 조건부 렌더링되고 있어 key 없이도 매번 새로 마운트되지만, 안전망
   차원에서 명시적으로 추가함)

④ app/_components/TimePickerModal.tsx — value prop 파싱해 setSelH/setSelM
   → useEffect 제거, selH/selM을 각각 useState 지연 초기화 함수로 전환(parseTime
   파싱 로직 그대로 이동). InputSection.tsx(수정 금지 파일)가 이미
   {timePickerTarget !== null && <TimePickerModal/>}로 열 때마다 새로 마운트하므로
   value는 마운트 시점에만 유효하면 충분 — 별도 key prop 추가 불필요.

⑤⑥ app/_components/ItemCard.tsx — editing 시 setIsContentExpanded(false) 등 폼 초기화
   → 두 useEffect를 제거하고 React 공식 "렌더 중 상태 조정" 패턴으로 교체
   (prevEditing 상태와 비교해 editing이 false→true로 바뀌는 순간에만 조건부로
   setState 호출). editing은 리스트 아이템이 유지된 채 반복적으로 토글되는 prop이라
   useState 지연 초기화(마운트 1회성)로는 두 번째 이후 편집 진입을 처리할 수 없고,
   key remount는 카드 자체를 매번 새로 만드는 과한 방식이라 부적합해 이 방식을 선택.
```

---

### 16. PWAInstallModal `<img>` → `next/image` 전환 🟢 ✅ 완료
**우선순위: 낮음 | 난이도: ★☆☆ | 소요: 15분**

`@next/next/no-img-element` 경고 해소. `npm run lint` 재실행 결과 소스 파일
기준 findings 0건(경고 사라짐), `npm run build` 정상 통과.

```
파일: app/_components/PWAInstallModal.tsx
수정: import Image from 'next/image' 추가
      <img src="/icon-192x192.png" ... className="rounded-2xl" />
      → <Image src="/icon-192x192.png" ... className="rounded-2xl" />
      (public/ 폴더 확인 결과 실제 파일명이 icon-192x192.png로 스펙과 일치,
       width/height/className 등 기존 속성 전부 유지, 다른 코드 변경 없음)
```

---

### 17. PROJECT_SPEC.md 컴포넌트 목록 동기화 🟢 ✅ 완료
**우선순위: 낮음 | 난이도: ★☆☆ | 소요: 10분**

실제 `app/_components/` 19개 파일과 PROJECT_SPEC.md §4 폴더 구조·§6 주요
컴포넌트 표를 대조해 누락됐던 6개 컴포넌트 추가 완료. 추가 후 재대조 결과
19개 파일과 정확히 일치, 더 누락된 파일 없음(코드 파일은 수정하지 않음).

```
파일: PROJECT_SPEC.md §4(폴더 구조), §6(주요 컴포넌트 표)
추가 완료:
- DatePickerModal.tsx   — 달력 UI 날짜 선택 모달
- TimePickerModal.tsx   — 스크롤 휠 시간 선택 모달 (24시간)
- DateErrorModal.tsx    — 날짜/시간 유효성 오류 안내 모달
- SplashScreen.tsx      — 앱 최초 진입 시 로고+이름 스플래시
- LoadingOverlay.tsx    — 데이터 fetch 중 전체 화면 로딩 스피너
- ToastMessage.tsx      — 저장/수정/삭제 성공·실패 토스트 알림
```

---

### 18. DESIGN_SPEC.md 문서 드리프트 정리 🟢 ✅ 완료

코드베이스 전체 점검 중 새로 발견됐던 DESIGN_SPEC.md 드리프트를 코드(`ItemCard.tsx`,
`ScheduleApp.tsx`, `AppHeader.tsx`, `TabBar.tsx`, `InputSection.tsx`, `globals.css`) 기준으로
전면 재작성 완료. 코드 파일은 수정하지 않음.

```
① §5-6, §8 — 삭제된 TabMoveModal 언급 전부 제거, TabSelectModal로 통합됐다고 명시
② §5-4 ItemCard — isContentExpanded 토글 + .card-action-inline 펼치기/접기 방식으로 전면
   재작성. 구버전 .item-icons/.icon-btn/.item.expanded는 "죽은 CSS"로 명시(마크업 없음)
③ §5-3 "50자 이내" → "40자 이내"로 전체 교체. §3-5 글자수 카운터도 3단계(ok/warn/over)에서
   실제 코드가 쓰는 2단계(ok/over, 40자 기준)로 수정, .char-warn은 죽은 CSS로 명시
④ §5-7 신규 추가: SplashScreen(fixed, var(--btn-bg), 800ms 유지 후 페이드아웃)/
   LoadingOverlay(absolute, rgba(0,0,0,0.3), IconLoader2)/ToastMessage(absolute top 60px,
   성공 #E8F5E9/실패 #FCEBEB)/PWAInstallModal(fixed→absolute 명시)
⑤ 추가로 발견한 드리프트도 코드 기준 수정:
   - §5-1 AppHeader — 텍스트형 .theme-btn 등 구버전 서술 → 실제 아이콘 전용 .header-btn
     32×32 정사각형 + 순서(?, 새로고침, 테마, 로그아웃)로 교체
   - §5-2 TabBar — 실제 DOM 순서는 액션 버튼(완료/메모)이 왼쪽, 탭 목록+추가 버튼이
     오른쪽(기존 문서는 반대로 서술)
   - §5-3 InputSection — 날짜 4칸 한 줄이 아니라 날짜 줄/시간 줄로 분리된 2행 구조이며
     각 입력칸에 DatePickerModal/TimePickerModal을 여는 아이콘 버튼이 붙음, 키보드 흐름도
     실제 코드(시작일·종료일 Enter 모두 → 시작시간으로 이동)로 정정
   - §9 아이콘 표 — IconLoader2/IconAlertTriangle 추가, IconPencil/IconTrash 실제 크기(13px/14px)로 정정
```

**빌드 확인:** `npm run build` 실행 결과 `EISDIR: illegal operation on a directory, readlink
'app/auth/callback/route.ts'` 에러로 실패 — `git status` 확인 결과 이번 작업에서 변경된 파일은
`DESIGN_SPEC.md`뿐이므로 문서 수정과 무관한 기존 Windows/webpack 환경 이슈로 판단됨(캐시 삭제 후
재시도에도 동일하게 재현). 코드 파일을 건드리지 않았으므로 문서 작업 자체는 완료로 처리하되,
빌드 이슈는 별도로 확인 필요.

---

### 19. 수정 모드 종료시간 미표시 버그 수정 (EDIT_BUG_REPORT.md §2) 🟡 ✅ 완료
**우선순위: 높음 | 난이도: ★☆☆ | 소요: 5분**

`EDIT_BUG_REPORT.md` 탐색 결과로 확인된 버그. 같은 날 시작/종료 시간이 모두
있는 일정을 수정 모드로 열면 종료시간 입력란이 비어있는 채로 표시됨.

```
파일: app/_components/ItemCard.tsx L67 (수정 전 기준)
원인: editTimeEnd 초기화 조건이 isRange(item)에 의존.
      isRange()는 "시작일 ≠ 종료일"일 때만 true를 반환하므로,
      같은 날짜 안에서 시간만 다른 경우 item.endedAt에 유효한 값이
      있어도 무시하고 빈 문자열로 초기화됨.

수정:
const et = (item.isAllDay === false && isRange(item)) ? extractTime(item.endedAt) : null
→
const et = (item.isAllDay === false && !!item.endedAt) ? extractTime(item.endedAt) : null

부수 변경: 파일 내 isRange()를 더 이상 사용하지 않게 되어
import 목록에서 isRange 제거 (미사용 import 방지).
isRange() 함수 자체는 lib/dateUtils.ts에서 fmtDateLine() 등 다른 곳에서
계속 사용 중이므로 삭제하지 않음.
```

**빌드 확인:** `npm run build` 정상 통과(기존 middleware→proxy 경고,
Edge Runtime 관련 경고만 존재, 신규 에러 없음).

**남은 항목:** `EDIT_BUG_REPORT.md` §1(종료일이 ISO 형식으로 노출되는 문제,
`date_end_raw` 컬럼 미연동)은 이번 작업 범위에 포함되지 않음 — 별도 요청 시 조치.

---

### 20. 종료일 형식 불일치 수정 (EDIT_BUG_REPORT.md §1) 🟡 ✅ 완료
**우선순위: 높음 | 난이도: ★★☆ | 소요: 20분**

DB에 존재하지만 코드에서 미사용이던 `schedules.date_end_raw` 컬럼을 실제
읽기/쓰기 경로에 연결. 기존에는 `dateEndRaw`가 매번 `ended_at` ISO
타임스탬프에서 `isoToDateRaw()`로 재조립되어, 시작일(`0905` 형식 원문 유지)과
종료일(`2026-09-05` ISO 재조립)의 표시 형식이 서로 달랐음.

```
파일: lib/hooks/useSchedules.ts
① DbSchedule 타입에 date_end_raw: string 추가
② AddScheduleInput 타입에 date_end_raw?: string 추가
③ UpdateScheduleInput 타입에 date_end_raw?: string 추가
④ addSchedule() INSERT 페이로드에 date_end_raw: input.date_end_raw ?? '' 추가
⑤ updateSchedule()은 기존에도 .update(input)으로 전달받은 객체를 그대로 DB에
   전달하는 구조라, UpdateScheduleInput에 date_end_raw?를 추가하는 것만으로
   호출부가 해당 필드를 넘기면 자동으로 반영됨 — 함수 내부에 별도의
   조건부 스프레드 코드를 추가하지 않음(기존 범용 패스스루 구조와 중복되는
   불필요한 추상화라 판단)

파일: app/_components/ScheduleApp.tsx
① toScheduleItem() — dateEndRaw: row.date_end_raw || isoToDateRaw(row.ended_at)
   원문 date_end_raw 우선 사용, 비어있으면(기존 데이터) ISO 폴백 유지.
   isoToDateRaw() 함수는 삭제하지 않고 폴백용으로 계속 사용.
② handleSaveEditWithTime() — updateSchedule() 호출(날짜/시간 있는 저장 경로)에
   date_end_raw: dateEndRaw 추가. 날짜/시간 없는 메모 전용 저장 분기는
   date_end_raw와 무관해 변경하지 않음.
③ handleSaveEdit() — updateSchedule() 호출에 date_end_raw: dateEndRaw 추가.
④ handleAddItem() — addSchedule() 호출에 date_end_raw: dateEndRaw 추가.
```

**빌드 확인:** `npm run build` 정상 통과(기존 middleware→proxy 경고,
Edge Runtime 관련 경고만 존재, 신규 에러 없음).

**수동 확인 필요(Supabase 콘솔 접근이 필요한 항목이라 코드 작업만으로는
검증 불가):** 종료일 저장 후 Supabase Table Editor에서 `schedules.date_end_raw`
컬럼에 값이 실제로 채워지는지, 그리고 수정 모드 재진입 시 종료일 input이
`'0905'`처럼 시작일과 동일한 원문 형식으로 표시되는지는 실제 로그인 후
브라우저에서 직접 확인 필요.

---

### 21. 하루 일정(당일 시간 범위) 자동 처리 🟡 ✅ 완료
**우선순위: 보통 | 난이도: ★★☆ | 소요: 20분**

시작일 + 시작시간 + 종료시간만 입력하고 종료일을 비워두면 `ended_at`이
저장되지 않아 종료시간이 통째로 유실되던 문제. 종료일을 시작일과 동일하게
자동 보완하도록 수정.

```
파일: app/_components/ScheduleApp.tsx
① handleAddItem() — 날짜 파싱 직전에 effectiveDateEndRaw 계산 추가:
   종료일이 비어있고 종료시간만 입력된 경우 시작일(dateRaw)을 종료일로 간주.
   이후 parsedEnd/endedAt 계산과 addSchedule() 호출의 date_end_raw를
   dateEndRaw 대신 effectiveDateEndRaw로 교체.
② handleSaveEditWithTime() — 동일한 effectiveDateEndRaw 계산을
   "날짜/시간 없음" 조기 반환 분기 이후, 파싱 직전에 추가.
   parsedEnd/endedAt 계산과 updateSchedule() 호출의 date_end_raw를
   effectiveDateEndRaw로 교체.
   (hasDateOrTime 판별 자체는 원본 dateEndRaw 기준 그대로 유지 — 이 판별은
   "날짜/시간 아무것도 없는 메모 저장" 분기를 가르는 것이라 종료일 자동
   보완 로직과 무관함)

파일: lib/dateUtils.ts
확인 결과: fmtDateLine()에 당일 시작/종료 시간 범위 표시 로직이 이미
구현되어 있음(L300-307, isSameDate(startDate, endDate)일 때
"9월 5일(토) 오전 10:00 - 오후 12:00" 형식으로 시간 범위를 합쳐 반환).
→ 수정 불필요. 문제의 원인은 표시 로직이 아니라 종료일을 비워두면
ended_at 자체가 저장되지 않아 이 분기에 도달하지 못하는 것이었으므로,
ScheduleApp.tsx의 저장 단계 수정만으로 해결됨.
```

**빌드 확인:** `npm run build` 정상 통과(기존 middleware→proxy 경고,
Edge Runtime 관련 경고만 존재, 신규 에러 없음).

**수동 확인 필요:** 시작일만 입력해 종료일을 자동 보완시킨 경우 카드 표시
문구, Supabase `date_end_raw` 컬럼 저장값, 기존 기간 일정(종료일 직접 입력)
동작 유지 여부는 로그인 후 브라우저에서 직접 확인 필요.

---

## 완료 기준 (매 작업마다)

```
□ npm run build 에러 없음
□ 로컬(localhost:3000) 직접 확인
□ git push → Vercel 배포 정상
□ 완료 후 이 파일의 해당 항목 상태 업데이트
```

---

## Claude Code 참조 파일

```
@AGENTS.md
@PROJECT_SPEC.md
@SUPABASE_TABLE.md
@CLAUDE.md
```

---

## AUDIT 미조치 목록 (AUDIT_REPORT.md 통합)
> 총 18건 중 3건 완료(커밋 d5ee80a), 15건 미조치

| # | 위험도 | 파일 | 내용 | ROADMAP 연결 |
|---|--------|------|------|-------------|
| 4 | 🟡 | useAuth.ts L14 | .catch() 누락 | ROADMAP #4 ✅ 완료 |
| 5 | 🟡 | ScheduleApp.tsx L219 | 저장 실패 피드백 없음 | ROADMAP #5 ✅ 완료 |
| 6 | 🟡 | ScheduleApp.tsx L170 | 종료일만 입력 시 우회 | ROADMAP #6 ✅ 완료 |
| 7 | 🟡 | PWAInstallModal.tsx L11 | position: fixed 위반 | ROADMAP #7 ✅ 완료 |
| 8 | 🟡 | TabNameModal.tsx L158 | iOS 줌 font-size 14px | ROADMAP #3 ✅ 완료 |
| 9 | 🟡 | useTabs.ts L112 | 탭 삭제 시 일정 미처리 | ROADMAP #9 ✅ 완료 |
| 10 | 🟡 | useTabs.ts/useSchedules.ts | RLS 전적 의존 | ROADMAP #10 ✅ 완료 |
| 11 | 🟡 | middleware.ts L41 | PWA 경로 미제외 | ROADMAP #8 ✅ 완료 |
| 12 | 🟢 | ItemCard.tsx L6 | 미사용 import | ROADMAP #11 ✅ 완료 |
| 13 | 🟢 | ScheduleApp.tsx L154 | 미사용 변수 | ROADMAP #11 ✅ 완료 |
| 14 | 🟢 | useTabs.ts L126 | 미사용 export | ROADMAP #11 ✅ 완료 |
| 15 | 🟢 | useSchedules.ts L41 | 미사용 파라미터 | ROADMAP #11 ✅ 완료 |
| 16 | 🟢 | ItemCard.tsx L49 | 편집 취소 펼침 미복원 | ROADMAP #12 ✅ 완료 |
| 17 | 🟢 | ItemCard.tsx L169 | 죽은 셀렉터 | ROADMAP #12 ✅ 완료 |
| 18 | 🟢 | useTabs.ts 외 2곳 | console.error 노출 | ROADMAP #13 ✅ 완료 |
