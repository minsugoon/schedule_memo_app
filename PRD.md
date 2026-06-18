# 📋 할 일 메모장 (Schedule Memo) — PRD
> Product Requirements Document v2.0
> 기준일: 2026-06-17 | 스택 확정: Next.js App Router + Supabase

---

## 1. 프로젝트 개요

### 1.1 제품 비전
구글 계정으로 로그인하고, 어느 기기에서든 개인·회사 일정을 간편하게 관리할 수 있는 **모바일 퍼스트 웹 메모장**

### 1.2 현재 상태 (2026-06-17)
| 항목 | 상태 |
|------|------|
| UI 구현 | ✅ 완료 (localStorage 기반 동작 중) |
| GitHub 연동 | ✅ 완료 |
| Vercel 배포 | ✅ 완료 (https://schedulememoapp.vercel.app) |
| Supabase 프로젝트 | ✅ 생성 완료 |
| Google OAuth | ✅ 설정 완료 |
| 환경변수 등록 | ✅ 완료 (NEXT_PUBLIC_ prefix) |
| Supabase 코드 연동 | 🔲 미완료 — 현재 작업 목표 |

### 1.3 기술 스택 (확정)
| 레이어 | 기술 | 버전 |
|--------|------|------|
| 프레임워크 | **Next.js (App Router)** | 16.2.9 |
| UI | React + React DOM | 19.2.4 |
| 언어 | TypeScript | 5.x |
| 스타일 | Tailwind CSS + PostCSS | 4.x |
| 아이콘 | @tabler/icons-react | 3.44.0 |
| 백엔드 | **Supabase** (PostgreSQL + Auth) | — |
| 인증 | Supabase Auth — Google OAuth 2.0 | — |
| 배포 | Vercel | — |

> ⚠️ Vite가 아닌 **Next.js App Router** 기반입니다.
> 환경변수는 `NEXT_PUBLIC_` prefix, 접근은 `process.env.NEXT_PUBLIC_*` 사용

---

## 2. 폴더 구조 (현재 + 추가 예정)

```
schedule_memo_app/
├── app/
│   ├── _components/              # 클라이언트 컴포넌트 ('use client')
│   │   ├── ScheduleApp.tsx       # 루트 상태 관리
│   │   ├── AppHeader.tsx         # 헤더 (시계·날짜·테마·로그인 상태)
│   │   ├── TabBar.tsx            # 탭 바 (전체/개인/회사 + 동적 탭)
│   │   ├── InputSection.tsx      # 일정 입력 폼
│   │   ├── ItemList.tsx          # 필터링·정렬 목록
│   │   └── ItemCard.tsx          # 개별 항목 카드
│   ├── login/
│   │   └── page.tsx              # 🔲 로그인 페이지 (신규)
│   ├── layout.tsx                # 루트 레이아웃
│   ├── page.tsx                  # 메인 페이지
│   └── globals.css               # CSS 변수 디자인 시스템
├── lib/
│   ├── types.ts                  # 공통 타입 정의 (확장 예정)
│   ├── dateUtils.ts              # 날짜 파싱·포맷 유틸
│   ├── supabase/
│   │   ├── client.ts             # 🔲 브라우저용 Supabase 클라이언트
│   │   └── server.ts             # 🔲 서버 컴포넌트용 클라이언트
│   └── hooks/
│       ├── useAuth.ts            # 🔲 인증 상태 관리
│       ├── useTabs.ts            # 🔲 탭 CRUD
│       └── useSchedules.ts       # 🔲 일정 CRUD
├── middleware.ts                 # 🔲 인증 미들웨어 (미보호 라우트 차단)
├── .env.local                    # 환경변수 (gitignore)
├── next.config.ts
└── tsconfig.json
```

> 🔲 = 신규 추가 필요

---

## 3. 데이터 모델

### 3.1 현재 타입 (lib/types.ts) — 유지
```typescript
interface ScheduleDate {
  y: number;
  m: number;
  d: number;
}

interface ScheduleItem {
  id: number;
  date: ScheduleDate | null;
  dateRaw: string;
  dateEnd: ScheduleDate | null;
  dateEndRaw: string;
  memo: string;
  done: boolean;
  createdAt: number;
  category: 'personal' | 'work';
}

type TabKey = 'all' | 'personal' | 'work';
```

### 3.2 Supabase 타입 (추가 예정)
```typescript
// Supabase DB 행 타입
interface DbSchedule {
  id: string;               // uuid
  user_id: string;          // auth.users 참조
  tab_id: string | null;    // tabs 참조
  started_at: string | null;    // timestamptz
  ended_at: string | null;      // timestamptz
  is_all_day: boolean;
  date_raw: string;
  date_end_raw: string;
  memo: string;
  is_done: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface DbTab {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  icon: string | null;
  sort_order: number;
  is_default: boolean;
  created_at: string;
}

interface DbUserSettings {
  id: string;
  user_id: string;
  language: 'ko' | 'en' | 'ja' | 'zh';
  theme: 'light' | 'dark';
  updated_at: string;
}
```

---

## 4. Supabase DB 스키마 (4개 테이블)

```
auth.users (Supabase 기본)
    │
    ├── user_settings   (1:1) 언어·테마 설정
    ├── tabs            (1:N) 사용자 정의 탭 (최대 10개)
    │       └── tab_labels  (1:N) 탭 이름 다국어
    └── schedules       (1:N) 일정 데이터
```

신규 가입(Google 로그인) 시 DB 트리거가 자동으로:
- `user_settings` 1행 생성
- `전체` / `개인` 기본 탭 + 4개국어 레이블 생성

---

## 5. 기능 명세

### 5.1 구현 완료
- [x] 일정 CRUD (추가·수정·삭제·완료 토글)
- [x] 날짜 범위 일정 (시작일~종료일)
- [x] 다양한 날짜 형식 자동 파싱
- [x] 카테고리 탭 (전체/개인/회사)
- [x] 오늘 일정 자동 강조
- [x] 라이트/다크 테마
- [x] 실시간 시계
- [x] localStorage 영속성
- [x] 모바일 퍼스트 반응형 (430px)

### 5.2 구현 예정 (Supabase 연동)
- [ ] Google OAuth 로그인 / 로그아웃
- [ ] 세션 유지 (미들웨어)
- [ ] 미인증 접근 시 /login 리다이렉트
- [ ] localStorage → Supabase DB 마이그레이션
- [ ] 멀티 디바이스 동기화
- [ ] 동적 탭 추가/삭제 (최대 10개)
- [ ] 탭 이름 다국어 지원

### 5.3 미래 계획 (Phase 3)
- [ ] 날짜 + 시간 입력
- [ ] 알림 (PWA Push)
- [ ] 드래그앤드롭 순서 변경
- [ ] 월별 캘린더 뷰

---

## 6. 환경변수

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

> Next.js에서 `NEXT_PUBLIC_` prefix가 붙은 변수만 브라우저에 노출됩니다.
> `process.env.NEXT_PUBLIC_SUPABASE_URL` 방식으로 접근합니다.

---

## 7. 비기능 요구사항

| 항목 | 기준 |
|------|------|
| 성능 | 목록 렌더링 100ms 이내 |
| 보안 | Supabase RLS로 타인 데이터 접근 차단 |
| 접근성 | 체크박스 role/aria-label 명시 |
| 브라우저 | Chrome, Safari, Edge 최신 버전 |
| 반응형 | 320px ~ 1920px |
