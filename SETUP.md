# ⚡ SETUP 가이드 — 할 일 메모장

> 기준일: 2026-07-07
> 스택: Next.js 16 App Router + Supabase(`@supabase/ssr`) + Google OAuth + PWA
> 배포: https://schedulememoapp.vercel.app

---

## ✅ 현재 완료된 작업

- [x] Next.js App Router 프로젝트 (16.2.9) + Tailwind CSS 4 + @tabler/icons-react
- [x] UI 컴포넌트 전체 구현 (일정/메모 카드, 동적 탭, 각종 모달 — `PROJECT_SPEC.md` §6 참고)
- [x] Supabase 프로젝트 생성 + DB 스키마 적용 (`schedules`, `tabs`, `tab_labels`, `user_settings`)
- [x] Google OAuth 설정 (Supabase Providers)
- [x] `@supabase/ssr` 기반 클라이언트/서버 클라이언트, 미들웨어, OAuth 콜백, 로그인 페이지
- [x] `useAuth` / `useSchedules` / `useTabs` 훅 및 `ScheduleApp.tsx` 연동 완료
- [x] 사용자 정의 동적 탭 시스템 (추가/이름변경/삭제)
- [x] PWA 설치 지원 (`@ducanh2912/next-pwa`)
- [x] Vercel 환경변수 등록 (`NEXT_PUBLIC_` prefix) + 자동 배포

> 이 문서는 과거 "Supabase 연동 남은 작업" 가이드였습니다. 해당 작업은 모두 완료되었으며,
> 지금은 **로컬 환경을 처음부터 재현하거나 신규 기여자가 온보딩할 때 참고하는 레퍼런스**로 용도가
> 바뀌었습니다. 실제 구현된 내용은 `PROJECT_SPEC.md`, DB 스키마는 `SUPABASE_TABLE.md`를 확인하세요.

---

## Step 1. 로컬 환경 준비

```bash
git clone <repo-url>
cd schedule_memo_app
npm install
```

`package.json`의 핵심 의존성:

```json
{
  "dependencies": {
    "@ducanh2912/next-pwa": "^10.2.9",
    "@supabase/ssr": "^0.12.0",
    "@supabase/supabase-js": "^2.108.2",
    "@tabler/icons-react": "^3.44.0",
    "next": "16.2.9",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  }
}
```

> ⚠️ Next.js App Router에서는 반드시 `@supabase/ssr` 패키지를 사용합니다.
> `@supabase/supabase-js` 단독으로는 세션이 유지되지 않습니다.

---

## Step 2. 환경 변수 설정

루트에 `.env.local`을 생성합니다 (커밋되지 않음, `.gitignore`의 `.env*` 패턴에 포함):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

> ✅ 반드시 `NEXT_PUBLIC_` prefix를 사용합니다. `VITE_`는 이 프로젝트와 무관합니다.
> 접근 방법: `process.env.NEXT_PUBLIC_SUPABASE_URL` (코드 전체에서 사용하는 커스텀 환경변수는 이 두 개뿐)

Vercel에도 동일한 두 키가 Settings → Environment Variables에 등록되어 있어야 합니다.

---

## Step 3. Supabase 프로젝트 설정 확인

### 3-1. DB 스키마

`schedules`, `tabs`, `tab_labels`, `user_settings` 4개 테이블이 필요합니다. 정확한 컬럼과
제약조건은 `SUPABASE_TABLE.md`를 그대로 SQL Editor에서 재현하면 됩니다. RLS(Row Level Security)
정책이 `user_id = auth.uid()` 기준으로 설정되어 있는지 확인하세요.

### 3-2. Redirect URL

Supabase 대시보드 → **Authentication** → **URL Configuration**

| 항목 | 값 |
|------|-----|
| Site URL | `https://schedulememoapp.vercel.app` |
| Redirect URLs | `https://schedulememoapp.vercel.app/**` |
| Redirect URLs (로컬) | `http://localhost:3000/**` |

### 3-3. Google OAuth Provider

Authentication → Providers → Google 활성화, Google Cloud Console에서 발급한 Client ID/Secret 등록.

---

## Step 4. 로컬 실행 및 동작 확인

```bash
npm run dev
# http://localhost:3000
```

확인 순서:
```
1. http://localhost:3000 → 미인증 상태면 /login 으로 자동 리다이렉트
2. Google 로그인 버튼 클릭 → 계정 선택 → /auth/callback → / 로 복귀
3. 일정/메모 추가 → Supabase 대시보드 Table Editor의 schedules 테이블에 반영 확인
4. 탭 추가/이름변경/삭제 → tabs 테이블 반영 확인
5. 새 브라우저 탭에서 열어도 데이터 유지되는지 확인 (실시간 구독은 없으므로 새로고침 필요)
```

다른 스크립트:
```bash
npm run build   # next build --webpack
npm start        # 프로덕션 서버 실행
npm run lint     # ESLint 검사
```

---

## Step 5. 배포 (Vercel)

```bash
git add .
git commit -m "커밋 메시지"
git push origin master
```

Push하면 Vercel이 자동으로 빌드/배포합니다. 배포 후
https://schedulememoapp.vercel.app 에서 동일하게 동작하는지 확인하세요.

---

## 🚨 자주 막히는 포인트

| 증상 | 원인 | 해결 |
|------|------|------|
| 로그인 후 `/` 안 돌아옴 | Redirect URL 미등록 | Supabase → URL Configuration 확인 |
| 세션이 유지 안 됨 | `@supabase/ssr` 미사용 | `lib/supabase/client.ts`/`server.ts` 패턴 확인 |
| 미들웨어 무한 루프 | matcher 설정 오류 | `middleware.ts`의 matcher가 `/auth/callback`, 정적 파일을 제외하는지 확인 |
| 데이터 저장 안 됨 | RLS 정책 누락 | Supabase SQL Editor에서 스키마·정책 재실행 |
| `process.env` undefined | 환경변수 prefix 오류 | `NEXT_PUBLIC_` prefix 확인, `.env.local` 재시작(`npm run dev` 재기동) |
| 탭이 5개 이상 추가 안 됨 | 의도된 제한 | `useTabs.ts`의 `MAX_TABS = 5` (메모 탭 제외) |
| 탭 이름이 2자로 잘림 | 의도된 제한 | `useTabs.ts`의 `MAX_NAME_LENGTH = 2` |
| 개발 모드에서 PWA 설치 안내 안 뜸 | 의도된 동작 | `next.config.ts`에서 `disable: NODE_ENV === 'development'` — 프로덕션 빌드에서 확인 |
| 여러 기기에서 실시간 반영 안 됨 | Realtime 구독 미구현 | 새로고침 버튼 사용 (향후 과제, `PROJECT_SPEC.md` §9) |

---

## ✅ 온보딩 체크리스트

```
□ npm install 완료
□ .env.local 생성 (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)
□ Supabase Redirect URL에 localhost:3000 등록
□ npm run dev → /login 리다이렉트 확인
□ Google 로그인 → 일정/메모 추가 → DB 반영 확인
□ 탭 추가/이름변경/삭제 동작 확인
□ 라이트/다크 테마 전환 확인
□ (선택) npm run build로 프로덕션 빌드 후 PWA 설치 프롬프트 확인
```
