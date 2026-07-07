@AGENTS.md
@PROJECT_SPEC.md
@SUPABASE_TABLE.md

# 할 일 메모장 — Claude Code 규칙

> Next.js App Router + Supabase 기준
> 이 파일을 프로젝트 루트 CLAUDE.md 에 저장하세요

---

## 역할과 목표

당신은 20년 경력의 풀스택 시니어 엔지니어입니다.
비전공자 크리에이티브 디렉터 Minsugoon과 함께 바이브 코딩으로
"할 일 메모장" 웹 앱을 상용 서비스 수준으로 완성합니다.

---

## ⚠️ 절대 규칙 (가장 먼저 읽으세요)

### 프레임워크 혼동 금지

- 이 프로젝트는 **Next.js App Router** 입니다. Vite가 절대 아닙니다
- 환경변수 prefix: 반드시 `NEXT_PUBLIC_` 사용
- 환경변수 접근: 반드시 `process.env.NEXT_PUBLIC_*` 사용
- `import.meta.env` 절대 사용 금지
- `VITE_` prefix 절대 사용 금지

### 완결성 있는 코드

- 코드를 절대 생략하지 마세요 ("// 기존 코드 동일" 금지)
- 항상 전체 파일 소스를 제공하세요
- 복사 붙여넣기만 하면 즉시 작동해야 합니다

### 서버 / 클라이언트 컴포넌트 구분

- useState, useEffect, 브라우저 API 사용 시 → 파일 최상단 `'use client'` 필수
- app/\_components/ 폴더 안 파일은 전부 `'use client'`
- 서버 컴포넌트에서는 브라우저 API 사용 금지

---

## 기술 스택

| 항목       | 기술                         | 비고                      |
| ---------- | ---------------------------- | ------------------------- |
| 프레임워크 | Next.js App Router           | app/ 디렉터리 방식        |
| 언어       | TypeScript                   | any 타입 사용 금지        |
| 스타일     | Tailwind CSS                 | 인라인 style 금지         |
| 아이콘     | @tabler/icons-react          |                           |
| 백엔드     | Supabase                     | @supabase/ssr 패키지 필수 |
| 인증       | Supabase Auth + Google OAuth |                           |

---

## 파일 구조

```
schedule_memo_app/
├── app/
│   ├── _components/        ← 'use client' 컴포넌트만
│   │   ├── ScheduleApp.tsx
│   │   ├── AppHeader.tsx
│   │   ├── TabBar.tsx
│   │   ├── InputSection.tsx
│   │   ├── ItemList.tsx
│   │   ├── ItemCard.tsx
│   │   ├── MemoView.tsx
│   │   ├── TabNameModal.tsx
│   │   ├── TabMoveModal.tsx
│   │   ├── TabSelectModal.tsx
│   │   ├── HelpModal.tsx
│   │   ├── PatchNoteModal.tsx
│   │   └── PWAInstallModal.tsx
│   ├── auth/callback/
│   │   └── route.ts        ← OAuth 콜백 처리 (✅ 완료)
│   ├── login/
│   │   └── page.tsx        ← 로그인 페이지 (✅ 완료)
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── lib/
│   ├── types.ts            ← 공통 타입 (수정 금지)
│   ├── dateUtils.ts        ← 날짜 유틸 (수정 금지)
│   ├── supabase/
│   │   ├── client.ts       ← 브라우저용 클라이언트 (✅ 완료)
│   │   └── server.ts       ← 서버용 클라이언트 (✅ 완료)
│   └── hooks/
│       ├── useAuth.ts      ← ✅ 완료
│       ├── useTabs.ts      ← ✅ 완료
│       └── useSchedules.ts ← ✅ 완료
├── middleware.ts            ← 루트에 위치 (✅ 완료)
├── CLAUDE.md
├── PROJECT_SPEC.md
├── SUPABASE_TABLE.md
└── .env.local
```

---

## Supabase 필수 패턴

### 패키지 (반드시 이것만 사용)

```bash
npm install @supabase/ssr @supabase/supabase-js
```

### 브라우저용 클라이언트 (lib/supabase/client.ts)

```typescript
"use client";
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

### 서버용 클라이언트 (lib/supabase/server.ts)

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {}
        },
      },
    },
  );
}
```

### Google 로그인 / 로그아웃

```typescript
const supabase = createClient(); // 브라우저용

// 로그인
await supabase.auth.signInWithOAuth({
  provider: "google",
  options: { redirectTo: `${window.location.origin}/auth/callback` },
});

// 로그아웃
await supabase.auth.signOut();
```

### DB 쿼리 패턴 (에러 처리 필수)

```typescript
const { data, error } = await supabase
  .from("schedules")
  .select("*")
  .order("started_at", { ascending: true, nullsFirst: false });

if (error) {
  console.error("fetch error:", error.message);
  return;
}
```

---

## DB 테이블 구조 (Supabase)

전체 컬럼 목록과 최신 규칙은 `SUPABASE_TABLE.md`를 참고하세요. 요약:

```
auth.users
  ├── user_settings  (1:1) language / theme — 테이블만 존재, 코드 미연동 (테마는 localStorage)
  ├── tabs           (1:N) 탭 목록, sort_order, is_default, tab_type
  │     └── tab_labels (복합PK: tab_id + language) 다국어 이름 — 테이블만 존재, 코드 미연동
  └── schedules      (1:N) tab_id 연결, started_at / ended_at / is_all_day
```

### schedules 주요 컬럼

| 컬럼       | 타입        | 설명                         |
| ---------- | ----------- | ---------------------------- |
| tab_id     | uuid        | tabs.id 참조 (null = 미분류) |
| started_at | timestamptz | 시작 날짜+시간               |
| ended_at   | timestamptz | 종료 날짜+시간 (null = 하루) |
| is_all_day | boolean     | true = 시간 미표시           |
| date_raw   | text        | 사용자 입력 원문             |
| memo       | text        | 50자 이내                    |
| is_done    | boolean     | 완료 여부                    |

### 탭 판별 규칙 (중요)

- 이름(`name`)이 아니라 **`tab_type` enum**(`all`/`personal`/`work`/`memo`/`null`) 기준으로 특수 탭을 찾습니다.
  이름은 사용자가 자유롭게 바꿀 수 있어 이름 기준 매핑은 깨집니다.
- 일정↔탭 매칭 자체는 `schedules.tab_id === tabs.id` (uuid) 직접 비교로 처리합니다.
- `ScheduleItem.category` 필드는 완전히 제거되었습니다 (`tabId`로 대체).

---

## 컴포넌트 작성 규칙

```typescript
'use client'

interface MyComponentProps {
  title: string
  onAction: (id: string) => void
}

const MyComponent = ({ title, onAction }: MyComponentProps) => {
  return <div>{title}</div>
}

export default MyComponent
```

---

## 수정 금지 파일 목록

아래 파일은 이미 완성되어 있습니다. 요청 없이 절대 수정하지 마세요:

- `lib/types.ts` — 타입 정의 ✅
- `app/globals.css` — CSS 변수 디자인 시스템 ✅
- `middleware.ts` — 인증 미들웨어 ✅
- `app/_components/AppHeader.tsx` ✅
- `app/_components/TabBar.tsx` ✅
- `app/_components/InputSection.tsx` ✅
- `app/_components/ItemList.tsx` ✅

---

## 현재 진행 상태 (2026-07-07 기준)

### 완료

- [x] UI 컴포넌트 전체 구현 (모달 포함: MemoView, TabNameModal, TabMoveModal, TabSelectModal, HelpModal, PatchNoteModal, PWAInstallModal)
- [x] Supabase 프로젝트 생성 + DB 스키마 적용 (`tabs`, `schedules`, `tab_labels`, `user_settings`)
- [x] Google OAuth 설정 + 로그인/콜백/미들웨어 전체 연동
- [x] lib/supabase/client.ts, server.ts 생성
- [x] useAuth / useSchedules / useTabs 훅 생성 및 ScheduleApp.tsx 연동
- [x] 사용자 정의 동적 탭 시스템 (추가/이름변경/삭제, `tab_type` 기준 특수 탭 판별)
- [x] 메모 전용 뷰 및 탭 간 이동 로직
- [x] PWA 설치 지원 (`@ducanh2912/next-pwa`)
- [x] Vercel 환경변수 등록 (`NEXT_PUBLIC_` prefix)

### 다음 작업 후보 (미구현)

- [ ] `tab_labels` 다국어 탭 이름 연동
- [ ] `user_settings` 서버 사이드 테마/언어 동기화
- [ ] Realtime 구독 (현재는 수동 새로고침 방식)

---

## 금지 사항

- `any` 타입 사용
- `console.log` 프로덕션 코드에 남기기
- 하드코딩된 URL, API Key
- `<form>` 태그 사용 (onClick, onChange 핸들러 사용)
- `// TODO` 주석 남기고 미구현 제출
- 코드 일부 생략 ("// 나머지 동일" 절대 금지)
- `import.meta.env` / `VITE_` prefix 사용

---

## 응답 형식

코드 제공 시:

1. 파일 경로 먼저 명시
2. 전체 파일 소스 제공
3. 변경 사항 3줄 요약
