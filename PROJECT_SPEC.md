# PROJECT_SPEC — 할 일 메모장 (Schedule Memo App)

> 현재 기준: 2026-06-17

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 앱 이름 | 할 일 메모장 |
| 목적 | 날짜 기반 일정/메모 관리 (개인·회사 카테고리 분리) |
| 배포 플랫폼 | Vercel |
| 저장소 | GitHub (master 브랜치) |

---

## 2. 기술 스택

| 분류 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | **Next.js (App Router)** | 16.2.9 |
| UI 라이브러리 | React + React DOM | 19.2.4 |
| 언어 | TypeScript | 5.x |
| 스타일 | Tailwind CSS + PostCSS | 4.x |
| 아이콘 | @tabler/icons-react | 3.44.0 |
| 백엔드(예정) | Supabase | — |

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

### 3-2. Vercel 환경 변수

Vercel 대시보드 → Settings → Environment Variables에 동일한 두 키 등록 완료.

---

## 4. 폴더 구조

```
schedule_memo_app/
├── app/                        # Next.js App Router 루트
│   ├── _components/            # 클라이언트 컴포넌트
│   │   ├── ScheduleApp.tsx     # 루트 상태 관리 컴포넌트
│   │   ├── AppHeader.tsx       # 헤더 (시계, 날짜, 테마 토글)
│   │   ├── TabBar.tsx          # 탭 바 (전체/개인/회사)
│   │   ├── InputSection.tsx    # 일정 입력 폼
│   │   ├── ItemList.tsx        # 필터링·정렬된 목록 컨테이너
│   │   └── ItemCard.tsx        # 개별 항목 카드
│   ├── layout.tsx              # 루트 레이아웃
│   ├── page.tsx                # 메인 페이지 (ScheduleApp 마운트)
│   └── globals.css             # CSS 변수 기반 디자인 시스템
├── lib/
│   ├── types.ts                # 공통 TypeScript 타입 정의
│   └── dateUtils.ts            # 날짜 파싱·포맷·정렬 유틸리티
├── public/                     # 정적 자산
├── .env.local                  # 로컬 환경 변수 (gitignore됨)
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
└── eslint.config.mjs
```

---

## 5. 데이터 모델 (`lib/types.ts`)

```typescript
interface ScheduleDate {
  y: number;   // 연도
  m: number;   // 월
  d: number;   // 일
}

interface ScheduleItem {
  id: number;
  date: ScheduleDate | null;      // 파싱된 시작일
  dateRaw: string;                // 시작일 원본 입력
  dateEnd: ScheduleDate | null;   // 파싱된 종료일
  dateEndRaw: string;             // 종료일 원본 입력
  memo: string;                   // 메모 (최대 50자)
  done: boolean;                  // 완료 여부
  createdAt: number;              // 생성 타임스탬프
  category: 'personal' | 'work'; // 카테고리
}

type TabKey = 'all' | 'personal' | 'work';
```

---

## 6. 주요 컴포넌트

| 컴포넌트 | 역할 |
|----------|------|
| `ScheduleApp` | 전체 상태(`items`, `tab`, `theme`) 관리, localStorage 동기화 |
| `AppHeader` | 실시간 시계, 오늘 날짜, 라이트/다크 테마 토글 버튼 |
| `TabBar` | 전체·개인·회사 탭 전환, 탭별 항목 개수 표시 |
| `InputSection` | 시작일·종료일·메모 입력, Enter 키 이동, 50자 글자 수 카운터 |
| `ItemList` | 탭 기준 필터링 → `sortItems()` 정렬 → `ItemCard` 렌더링 |
| `ItemCard` | 완료 토글, 인라인 수정, 삭제, "오늘" 뱃지, 카테고리 뱃지 |

---

## 7. 유틸리티 (`lib/dateUtils.ts`)

| 함수 | 설명 |
|------|------|
| `parseDate(raw)` | 다양한 형식 파싱 → `ScheduleDate \| null` |
| `getToday()` | 현재 날짜 반환 |
| `fmtShort(date)` | `06월 09일(금)` 형식 포맷 |
| `dateKey(date)` | `20240609` 형식 정렬 키 생성 |
| `isTodayInRange(start, end)` | 오늘이 시작일~종료일 범위 내인지 확인 |
| `isRange(item)` | 종료일 존재 여부 확인 |
| `sortItems(items)` | 날짜 오름차순 + 생성 타임스탬프 순 정렬 |

**지원 날짜 입력 형식:** `2024-06-09`, `240609`, `20240609`, `6-9`, `06월 09일`, `2024년 6월 9일`, `0609`

---

## 8. 구현된 기능

- **일정 CRUD** — 추가, 인라인 수정, 삭제(확인), 완료 토글
- **날짜 범위** — 시작일만 또는 시작일~종료일 범위 일정
- **카테고리 분류** — 개인 / 회사, 탭으로 필터링
- **"오늘" 자동 강조** — 오늘 날짜가 범위 내이고 미완료인 항목에 뱃지 표시
- **라이트/다크 테마** — CSS 변수 기반, `data-theme` 속성으로 전환
- **실시간 시계** — 헤더에 HH:MM:SS 표시
- **로컬스토리지 영속성** — `schedule_memo_v2`, `memo_tab`, `memo_theme` 키에 자동 저장
- **키보드 네비게이션** — Tab 이동, Enter 다음 필드 이동/저장
- **반응형 레이아웃** — 430px 최대 너비, 모바일 우선 설계

---

## 9. 미구현 기능 (예정)

- [ ] Supabase 클라이언트 초기화 및 연동
- [ ] 사용자 인증 (Supabase Auth)
- [ ] 클라우드 데이터 동기화 (localStorage → Supabase DB)
- [ ] 멀티 디바이스 지원

---

## 10. 로컬 개발

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 프로덕션 빌드
npm run lint       # ESLint 검사
```

---

## 11. localStorage 스키마

| 키 | 타입 | 내용 |
|----|------|------|
| `schedule_memo_v2` | JSON (ScheduleItem[]) | 전체 항목 배열 |
| `memo_tab` | string | 마지막 선택 탭 (`all` \| `personal` \| `work`) |
| `memo_theme` | string | 마지막 선택 테마 (`light` \| `dark`) |
