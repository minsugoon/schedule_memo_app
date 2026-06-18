# ⚡ SETUP 가이드 — 할 일 메모장
> 기준일: 2026-06-17
> 스택: Next.js App Router + Supabase + Google OAuth
> 배포: https://schedulememoapp.vercel.app

---

## ✅ 완료된 작업 (건드리지 않아도 됩니다)

- [x] Next.js App Router 프로젝트 생성
- [x] Tailwind CSS + @tabler/icons-react 설치
- [x] UI 컴포넌트 전체 구현 (localStorage 기반 동작 중)
- [x] lib/types.ts, lib/dateUtils.ts 완성
- [x] GitHub 레포지토리 연결
- [x] Vercel 배포 (Push → 자동 배포)
- [x] Supabase 프로젝트 생성
- [x] Supabase DB 스키마 적용 (4개 테이블)
- [x] Google OAuth 설정 (Supabase Providers)
- [x] Vercel 환경변수 등록 (NEXT_PUBLIC_ prefix)
- [x] .env.local 생성

---

## 🔲 남은 작업 — Supabase 코드 연동

---

## Step 1. Supabase SSR 패키지 설치

VSCode 터미널에서:

```bash
npm install @supabase/ssr @supabase/supabase-js
```

> ⚠️ Next.js App Router에서는 반드시 `@supabase/ssr` 패키지를 사용해야 합니다.
> `@supabase/supabase-js` 단독으로 사용하면 세션이 유지되지 않습니다.

---

## Step 2. .env.local 확인

프로젝트 루트 `.env.local` 내용 확인:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

> ✅ `NEXT_PUBLIC_` prefix가 맞습니다. `VITE_`로 되어 있다면 수정하세요.
> 접근 방법: `process.env.NEXT_PUBLIC_SUPABASE_URL`

---

## Step 3. Supabase Redirect URL 추가 확인

Supabase 대시보드 → **Authentication** → **URL Configuration**

| 항목 | 값 |
|------|-----|
| Site URL | `https://schedulememoapp.vercel.app` |
| Redirect URLs | `https://schedulememoapp.vercel.app/**` |
| Redirect URLs (로컬) | `http://localhost:3000/**` |

> 로컬 개발을 위해 `http://localhost:3000/**` 도 추가해 두세요.

---

## Step 4. Claude Code 바이브코딩 순서

VSCode 터미널:

```bash
cd schedule_memo_app
claude
```

### 📋 권장 프롬프트 순서

아래 순서대로 하나씩 입력하세요. 한 번에 다 요청하지 말고 **하나 완료 후 다음 진행**합니다.

---

#### PROMPT 1 — Supabase 클라이언트 생성
```
@.cursorrules 를 읽고,
lib/supabase/client.ts 와 lib/supabase/server.ts 를 만들어줘.
Next.js App Router + @supabase/ssr 패키지 기준으로.
환경변수는 NEXT_PUBLIC_ prefix 사용.
```

---

#### PROMPT 2 — Auth Callback 라우트 생성
```
Google OAuth 로그인 후 세션을 처리하는
app/auth/callback/route.ts 를 만들어줘.
@supabase/ssr 의 exchangeCodeForSession 사용.
성공 시 / 로 리다이렉트.
```

---

#### PROMPT 3 — 미들웨어 생성
```
middleware.ts 를 프로젝트 루트에 만들어줘.
- 미인증 사용자 → /login 리다이렉트
- 인증 사용자가 /login 접근 → / 리다이렉트
- @supabase/ssr createServerClient 사용
- /login, /auth/callback, 정적 파일은 미들웨어 제외
```

---

#### PROMPT 4 — 로그인 페이지 생성
```
app/login/page.tsx 를 만들어줘.
- 'use client' 컴포넌트
- Google 로그인 버튼 하나
- lib/supabase/client.ts 의 createClient 사용
- signInWithOAuth provider: 'google'
- redirectTo: window.location.origin + '/auth/callback'
- 앱 타이틀 "📋 할 일 메모장" 표시
- 기존 globals.css CSS 변수 활용한 심플한 디자인
```

---

#### PROMPT 5 — useAuth 훅 생성
```
lib/hooks/useAuth.ts 를 만들어줘.
- 'use client' 훅
- 현재 로그인 유저 상태 관리 (user, loading)
- onAuthStateChange 로 실시간 세션 감지
- signOut 함수 포함
- lib/supabase/client.ts 사용
```

---

#### PROMPT 6 — useSchedules 훅 생성
```
lib/hooks/useSchedules.ts 를 만들어줘.
Supabase schedules 테이블 CRUD 전체 포함:
- fetchSchedules: tab_id 기준 필터, started_at 오름차순 정렬
- addSchedule: 추가 (user_id 자동 포함)
- updateSchedule: 수정
- deleteSchedule: 삭제
- toggleDone: is_done 토글
lib/supabase/client.ts 사용.
에러 처리 포함.
```

---

#### PROMPT 7 — useTabs 훅 생성
```
lib/hooks/useTabs.ts 를 만들어줘.
Supabase tabs 테이블 관리:
- fetchTabs: 현재 유저 탭 목록 sort_order 오름차순 조회
- addTab: 탭 추가 (최대 10개 체크)
- deleteTab: 탭 삭제 (is_default=true 삭제 불가)
- updateTabOrder: sort_order 업데이트
lib/supabase/client.ts 사용.
```

---

#### PROMPT 8 — ScheduleApp Supabase 연동
```
app/_components/ScheduleApp.tsx 를 수정해줘.
기존 localStorage 로직을 Supabase 로 교체:
- useAuth 로 로그인 유저 확인
- useSchedules 로 일정 CRUD
- useTabs 로 탭 목록 관리
- 로딩 상태 표시 (스피너 또는 skeleton)
- 로그아웃 버튼을 AppHeader에 전달
기존 UI/UX는 그대로 유지.
```

---

#### PROMPT 9 — AppHeader 로그아웃 버튼 추가
```
app/_components/AppHeader.tsx 에
로그아웃 버튼을 추가해줘.
- 우상단 테마 버튼 옆에 위치
- 아이콘: @tabler/icons-react 의 IconLogout
- 클릭 시 signOut 실행 후 /login 으로 이동
- 기존 UI 스타일과 동일하게
```

---

## Step 5. 로컬 동작 확인

```bash
npm run dev
# http://localhost:3000 접속
```

확인 순서:
```
1. http://localhost:3000 → /login 으로 자동 리다이렉트 되는지
2. Google 로그인 버튼 클릭 → 구글 계정 선택
3. 로그인 후 / 로 돌아오는지
4. Supabase 대시보드 → Table Editor → user_settings, tabs 에 데이터 생성됐는지
5. 일정 추가 → schedules 테이블에 저장되는지
6. 새 탭에서 열어도 데이터 유지되는지 (멀티 디바이스 동기화)
```

---

## Step 6. Vercel 재배포

```bash
git add .
git commit -m "feat: Supabase 연동 완료"
git push origin master
```

> Push 하면 Vercel이 자동으로 배포합니다.
> 배포 후 https://schedulememoapp.vercel.app 에서 동일하게 동작 확인.

---

## 📐 DB 테이블 구조 요약

```
user_settings   언어(ko/en/ja/zh), 테마(light/dark) — 유저당 1행
tabs            탭 목록, sort_order, is_default(삭제 불가)
tab_labels      탭 이름 다국어 번역 (tab_id + language 복합 PK)
schedules       일정 데이터, tab_id 연결, started_at/ended_at
```

---

## 🚨 자주 막히는 포인트

| 증상 | 원인 | 해결 |
|------|------|------|
| 로그인 후 `/` 안 돌아옴 | Redirect URL 미등록 | Supabase → URL Configuration 확인 |
| 세션이 유지 안 됨 | `@supabase/ssr` 미사용 | PROMPT 1 다시 실행 |
| 미들웨어 무한 루프 | matcher 설정 오류 | `/auth/callback` matcher 제외 확인 |
| 데이터 저장 안 됨 | RLS 정책 누락 | Supabase SQL Editor에서 스키마 재실행 |
| `process.env` undefined | 환경변수 prefix 오류 | `NEXT_PUBLIC_` prefix 확인 |
| 탭 자동 생성 안 됨 | 트리거 미실행 | SQL Editor에서 트리거 함수 재실행 |
| Claude Code가 Vite로 작성 | 프레임워크 혼동 | .cursorrules 의 ⚠️ 절대규칙 다시 강조 |

---

## ✅ 최종 완료 체크리스트

```
□ npm install @supabase/ssr @supabase/supabase-js 완료
□ lib/supabase/client.ts 생성
□ lib/supabase/server.ts 생성
□ app/auth/callback/route.ts 생성
□ middleware.ts 생성 (루트에 위치)
□ app/login/page.tsx 생성
□ useAuth, useSchedules, useTabs 훅 생성
□ ScheduleApp.tsx Supabase 연동 완료
□ AppHeader.tsx 로그아웃 버튼 추가
□ 로컬에서 Google 로그인 → 일정 추가 → DB 저장 확인
□ git push → Vercel 자동 배포 → 배포 버전 동작 확인
```
