# PROJECT_SPEC — 할 일 메모장 (Schedule Memo App)

> 현재 기준: 2026-07-15

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 앱 이름 | 할 일 메모장 |
| 목적 | 날짜 기반 일정/메모 관리 (사용자 정의 동적 탭으로 분류) |
| 배포 플랫폼 | Vercel |
| 저장소 | GitHub (master 브랜치) |
| 인증 | Supabase Auth (Google OAuth) |
| PWA | 설치 가능한 PWA (`@ducanh2912/next-pwa`) |

---

## 2. 기술 스택

| 분류 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | **Next.js (App Router)** | 16.2.9 |
| UI 라이브러리 | React + React DOM | 19.2.4 |
| 언어 | TypeScript | 5.x |
| 스타일 | Tailwind CSS + PostCSS | 4.x (JS 설정 파일 없이 `@import "tailwindcss"` + CSS 변수) |
| 아이콘 | @tabler/icons-react | 3.44.0 |
| 백엔드 | Supabase (`@supabase/ssr` + `@supabase/supabase-js`) | ssr ^0.12.0 / js ^2.108.2 |
| PWA | @ducanh2912/next-pwa | ^10.2.9 |

> **Vite가 아닌 Next.js 기반입니다.** App Router(`app/` 디렉터리) 방식을 사용하며, 서버 컴포넌트와 클라이언트 컴포넌트를 구분합니다.

---

## 3. 환경 설정

### 3-1. 로컬 (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=<Supabase 프로젝트 URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase anon key>
```

- `NEXT_PUBLIC_` prefix → 클라이언트 사이드에서 접근 가능
- `.gitignore`의 `.env*` 패턴으로 커밋 제외
- 코드 전체에서 참조하는 커스텀 환경변수는 이 두 개뿐 (`next.config.ts`의 `process.env.NODE_ENV`는 Next.js 기본 제공 변수)

### 3-2. Vercel 환경 변수

Vercel 대시보드 → Settings → Environment Variables에 동일한 두 키 등록 완료.

---

## 4. 폴더 구조

```
schedule_memo_app/
├── app/                          # Next.js App Router 루트
│   ├── _components/              # 클라이언트 컴포넌트 ('use client')
│   │   ├── ScheduleApp.tsx       # 루트 상태 관리 컴포넌트 (Supabase 연동 허브)
│   │   ├── AppHeader.tsx         # 헤더 (시계, 날짜, 테마 토글, 새로고침, 로그아웃)
│   │   ├── TabBar.tsx            # 동적 탭 바 (전체/개인/회사/커스텀), 완료 보기·메모 뷰 토글
│   │   ├── InputSection.tsx      # 일정/메모 입력 폼 (날짜·시간·메모)
│   │   ├── ItemList.tsx          # 탭 기준 필터링 → 정렬 → ItemCard 렌더링
│   │   ├── ItemCard.tsx          # 개별 항목 카드 (조회/인라인 수정/삭제/뱃지)
│   │   ├── MemoView.tsx          # 날짜 없는 메모 전용 뷰 (memo 탭)
│   │   ├── TabNameModal.tsx      # 탭 추가/이름 수정/삭제 모달
│   │   ├── TabSelectModal.tsx    # 카드 수정 저장 시 탭 선택 모달 (메모→탭 이동 포함, 구 TabMoveModal 통합)
│   │   ├── HelpModal.tsx         # 날짜/시간 입력 형식 도움말 모달
│   │   ├── PatchNoteModal.tsx    # 업데이트 내역(패치노트) 모달
│   │   ├── PWAInstallModal.tsx   # PWA 설치 유도 모달
│   │   └── OnboardingOverlay.tsx # 최초 사용자 온보딩 가이드 오버레이 (4단계 스포트라이트 툴팁)
│   ├── auth/callback/route.ts    # OAuth 콜백 처리 (서버, exchangeCodeForSession)
│   ├── login/page.tsx            # 로그인 페이지 (Google OAuth, 계정 전환)
│   ├── layout.tsx                # 루트 레이아웃 (테마 플리커 방지 스크립트 포함)
│   ├── page.tsx                  # 메인 페이지 (ScheduleApp 마운트)
│   ├── favicon.ico
│   └── globals.css               # CSS 변수 기반 디자인 시스템
├── lib/
│   ├── types.ts                  # 공통 TypeScript 타입 정의 (수정 금지)
│   ├── dateUtils.ts              # 날짜·시간 파싱/포맷/정렬 유틸리티 (수정 금지)
│   ├── supabase/
│   │   ├── client.ts             # 브라우저용 클라이언트 ('use client')
│   │   └── server.ts             # 서버용 클라이언트 (쿠키 어댑터)
│   └── hooks/
│       ├── useAuth.ts            # 로그인 유저 상태 + signOut
│       ├── useTabs.ts            # tabs 테이블 CRUD (DbTab 타입 포함)
│       └── useSchedules.ts       # schedules 테이블 CRUD (DbSchedule 타입 포함)
├── middleware.ts                 # 인증 미들웨어 (루트 위치)
├── public/                       # 정적 자산 + PWA 아이콘/서비스워커/매니페스트
├── .env.local                    # 로컬 환경 변수 (gitignore됨)
├── next.config.ts                # next-pwa 래핑 설정
├── tsconfig.json
├── postcss.config.mjs
└── eslint.config.mjs
```

---

## 5. 데이터 모델 (`lib/types.ts`)

```typescript
export interface ScheduleDate {
  y: number;   // 연도
  m: number;   // 월
  d: number;   // 일
}

export interface ScheduleItem {
  id: number;
  date: ScheduleDate | null;          // 파싱된 시작일
  dateRaw: string;                    // 시작일 원본 입력
  dateEnd: ScheduleDate | null;       // 파싱된 종료일
  dateEndRaw: string;                 // 종료일 원본 입력
  memo: string;                       // 메모 (최대 40자)
  done: boolean;                      // 완료 여부
  createdAt: number;                  // 생성 타임스탬프
  startedAt?: string | null;          // ISO — DB started_at
  endedAt?: string | null;            // ISO — DB ended_at
  isAllDay?: boolean;                 // true=시간 미표시
  tabId?: string | null;              // 소속 탭 uuid (tabs.id 직접 비교용)
}

export type TabKey = 'all' | 'personal' | 'work' | 'memo' | string; // 커스텀 탭은 uuid 문자열
export type ViewMode = 'tabs' | 'memo'; // 탭 목록 화면 vs 메모 전용 화면
```

> **⚠️ `category: 'personal' | 'work'` 필드는 완전히 제거되었습니다.**
> 탭 판별·필터링·뱃지 표시는 전부 `tabId === tabs[].id` 직접 비교로 처리하며,
> 표시용 이름/색상/타입은 `tabId`로 `tabs` 배열을 찾아서 가져옵니다.
> 자세한 매핑 규칙은 `SUPABASE_TABLE.md` 참고.

---

## 6. 주요 컴포넌트

| 컴포넌트 | 역할 |
|----------|------|
| `ScheduleApp` | 전체 상태(탭, 뷰 모드, 테마, 모달, 온보딩) 관리, `useAuth`/`useSchedules`/`useTabs` 연결, DB row → `ScheduleItem` 변환 |
| `AppHeader` | 실시간 시계, 오늘 날짜, 아이콘 전용 정사각형 버튼(`.header-btn`)으로 온보딩 안내(`?`)/새로고침/테마 토글/로그아웃(조건부) 제공 |
| `TabBar` | 사용자 정의 탭(최대 5개) 전환, 탭별 개수 표시, 탭 추가/이름변경/삭제, 완료 보기·메모 뷰 토글, 온보딩 대상 앵커 id(`onboarding-done-btn`/`onboarding-memo-btn`/`onboarding-add-tab-btn`) 보유 |
| `InputSection` | 시작/종료 날짜·시간, 메모 입력, Enter 키 이동, 40자 글자 수 카운터, 도움말 버튼 |
| `ItemList` | 탭/완료여부 기준 필터링 → `sortItems()` 정렬 → `ItemCard` 렌더링, 목록 컨테이너에 온보딩 앵커 id(`onboarding-card-area`) 보유 |
| `ItemCard` | 완료 토글, 인라인 수정(날짜·시간·메모), 삭제, 저장 시 탭 재배정(`TabSelectModal`), 오늘/진행중/탭 뱃지. `item.date` 유무(`hasDate`)로 일정 카드/메모 카드 레이아웃을 완전 분기 렌더링하며, 클릭 시 `isContentExpanded` 토글로 펼치기·접기(펼친 일정 카드는 날짜줄 옆에 수정/삭제 버튼, 펼친 메모 카드는 메모 옆에 수정/삭제 버튼, 뱃지는 하단으로 이동) |
| `MemoView` | 날짜 없는 메모(`memo` 탭) 전용 목록 + 빠른 추가 입력, `showDone` 기준 완료 메모 필터링, `ItemCard` 재사용 |
| `TabNameModal` | 탭 추가/이름 수정(최대 2자, 추천 이름 칩), 기본 탭이 아니면 삭제 가능 |
| `TabSelectModal` | 카드 편집 저장 시 목적지 탭 선택 (all/memo 제외). 메모에 날짜/시간이 추가될 때 이동할 탭 선택도 겸함 (구 `TabMoveModal` 기능 흡수, 죽은 코드였던 `TabMoveModal`은 삭제됨) |
| `HelpModal` / `PatchNoteModal` / `PWAInstallModal` | 날짜 입력 도움말, 패치노트, PWA 설치 유도 |
| `OnboardingOverlay` | 최초 진입 800ms 후 자동(또는 헤더 `?` 버튼으로 언제든) 표시되는 4단계 안내 오버레이. `targetId`로 실제 DOM 요소를 찾아 `getBoundingClientRect()`로 스포트라이트(`box-shadow` 방식) 강조, 화면 상단 고정 위치에 말풍선(제목+설명+N/4 진행+건너뛰기/다음·완료 버튼) 표시. 배경 클릭 시 종료와 동일하게 처리 |

---

## 7. 유틸리티 (`lib/dateUtils.ts`)

| 함수 | 설명 |
|------|------|
| `getToday()` | 현재 날짜를 `ScheduleDate`로 반환 |
| `parseDate(raw)` | 다양한 형식 파싱 → `ScheduleDate \| null` |
| `parseTime(raw)` | 오전/오후, `H:MM`, `HHMM`, `H시 M분` 등 시간 문자열 파싱 → `{h, m} \| null` |
| `fmtShort(date)` | `06월 09일(금)` 형식 포맷 + 요일 타입(`sat`/`sun`/`normal`) — 현재 카드 표시에는 미사용, 유틸로만 유지 |
| `fmtShortNoPad(date)` | `6월 9일(금)` 형식(0 패딩 없음) 포맷 |
| `fmtDateLine(startedAt, endedAt, isAllDay, dateRaw, dateEndRaw, dateEnd)` | 카드용 날짜 표시 문자열 생성 (하루/범위 × 종일/시간 4가지 케이스 모두 처리) |
| `extractTime(iso)` | ISO 문자열에서 `{h, m} \| null` 추출 (UTC 게터 사용, 0시 0분은 "시간 없음"으로 간주) |
| `fmtTime(h, m)` | `오전/오후 H:MM` 형식 포맷 |
| `dateKey(date)` | `20240609` 형식 정렬 키 생성 (null이면 맨 뒤로) |
| `timeToISO(date, h, m)` | 날짜+시각을 UTC ISO 문자열로 변환 |
| `calcDayDiff(target)` | 오늘과 대상 날짜의 일수 차이 |
| `isTodayInRange(start, end)` | 오늘이 시작일~종료일 범위 내인지 확인 |
| `isRange(item)` | 시작일과 다른 종료일이 있는지 확인 |
| `getBadgeInfo(item)` | `{isToday, isOngoing}` 뱃지 표시 여부 계산 |
| `sortItems(items)` | 날짜 → 시작 시각(하루종일은 뒤로) → 생성 타임스탬프 순 정렬 |
| `DAYS` | `['일','월','화','수','목','금','토']` 상수 |

**지원 날짜 입력 형식:** `2024-06-09`, `240609`, `20240609`, `6-9`, `06월 09일`, `2024년 6월 9일`, `0609`
**지원 시간 입력 형식:** `14:30`, `1430`, `오후 2시 30분`, `오전 9시` 등

---

## 8. 구현된 기능

- **일정/메모 CRUD** — 추가, 인라인 수정(날짜·시간·메모), 삭제(확인), 완료 토글
- **날짜·시간 범위** — 시작일만/범위 일정, `is_all_day` 여부에 따른 시간 표시
- **탭-일정 매칭 (`tab_type` 기반)** — 이름이 아닌 `tabs.tab_type` enum으로 특수 탭 판별, `schedules.tab_id === tabs.id` uuid 직접 비교로 매칭. `category` 필드는 완전히 제거됨
- **사용자 정의 동적 탭** — 개인/회사 기본 탭 + 커스텀 탭(최대 5개, 이름 최대 2자), 이름 변경/삭제
- **메모 전용 뷰** — 날짜 없는 메모를 별도 `memo` 탭에서 관리, 날짜/시간 추가 시 `TabSelectModal`로 실제 탭 선택 후 이동 (구 `TabMoveModal`은 죽은 코드로 판명되어 삭제, 기능은 `TabSelectModal`로 일원화)
- **날짜/시간 전체 표시** — `.item-date-line`은 말줄임 없이 항상 전체 텍스트 표시(`white-space: normal` + `word-break: keep-all`), 날짜/메모 줄을 분리해 메모 옆에는 뱃지(또는 펼친 상태의 수정/삭제 버튼)만 배치
- **카드 내용 펼치기/접기** — 카드를 클릭하면 `isContentExpanded` 상태가 토글되며 메모 전체 내용이 펼쳐짐(잘림 자동 감지 로직 없이 클릭 = 토글). `item.date` 유무(`hasDate`)로 일정 카드/메모 카드 레이아웃을 완전 분기: 일정 카드는 펼친 날짜줄 옆(`item-date-row-expanded`)에, 메모 카드는 펼친 메모 옆(`item-memo-row-expanded-no-date`)에 수정/삭제 버튼(`.card-action-inline`)이 나타나고, 오늘/진행중/탭 뱃지는 하단(`.item-badge-bottom`)으로 이동. 재클릭하면 기본 상태로 복귀. 구 아이콘 오버레이(`.item-icons`) 방식은 완전히 제거됨
- **긴 메모 오버플로우 방지** — `.item-body-col`/`.item-lines`에 `min-width: 0` + `overflow: hidden`, `.item-memo-row .item-memo-line`에 `white-space: nowrap` + `text-overflow: ellipsis` 적용해 40자 메모도 카드 폭 안에서 말줄임 처리
- **"오늘"/"진행중" 자동 뱃지** — `getBadgeInfo` 기반 표시
- **완료 항목 보기 토글** — 탭 바에서 완료 항목 표시/숨김. 일정 탭(`ItemList`)뿐 아니라 메모 뷰(`MemoView`)에도 `showDone`이 전달·적용되어 두 화면 모두 동일하게 동작
- **최초 사용자 온보딩 가이드** — 최초 진입 시 800ms 후 1회 자동 표시(`localStorage 'onboarding_seen_v1'`), 헤더 `?` 버튼으로 언제든 재실행(localStorage 덮어쓰지 않음). 완료 토글 → 메모 보기 → 탭 추가 → 카드 영역 순으로 4단계 스포트라이트 툴팁 안내
- **라이트/다크 테마** — CSS 변수 기반, `data-theme` 속성 전환, 플리커 방지 스크립트
- **실시간 시계** — 헤더에 HH:MM:SS 표시
- **Supabase 인증 + 데이터 동기화** — Google OAuth 로그인, `schedules`/`tabs` 테이블 CRUD, 멀티 디바이스 지원(수동 새로고침 기반)
- **PWA** — 설치 가능, 서비스워커(`next-pwa`), 홈 화면 추가 유도 모달
- **패치노트 모달** — 버전별 업데이트 내역 안내
- **키보드 네비게이션** — 입력 필드 간 Tab/Enter 이동
- **반응형 레이아웃** — 430px 최대 너비, 모바일 우선 설계

---

## 9. 미구현 / 향후 과제

- [ ] `tab_labels` 다국어 탭 이름 실제 연동 (테이블은 있으나 코드 미사용)
- [ ] `user_settings.theme`/`language` 서버 동기화 (현재 테마는 `localStorage`만 사용)
- [ ] Realtime 구독 (현재는 수동 새로고침 + CRUD 후 refetch 방식)
- [ ] 탭 순서 드래그 정렬 UI (`updateTabOrder`는 훅에 있으나 UI 미연결 여부 확인 필요)

---

## 10. 로컬 개발

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # 프로덕션 빌드 (--webpack)
npm start             # 프로덕션 서버 실행
npm run lint          # ESLint 검사
```

---

## 11. localStorage 사용 (하이브리드)

일정/탭 데이터는 100% Supabase로 이전되었으며, `localStorage`는 기기별 UI 환경설정에만 사용됩니다.

| 키 | 타입 | 내용 |
|----|------|------|
| `memo_theme` | string | 라이트/다크 테마 (`light` \| `dark`), `layout.tsx` 플리커 방지 스크립트가 읽음 |
| `pwa_installed` | boolean | PWA 설치 안내 재노출 여부 |
| `patch_seen_20260702` | boolean | 해당 버전 패치노트 모달 확인 여부 (버전별 키) |
| `onboarding_seen_v1` | boolean | 온보딩 가이드 오버레이 최초 자동 표시 여부 (헤더 `?` 버튼 재실행 시에는 덮어쓰지 않음) |
