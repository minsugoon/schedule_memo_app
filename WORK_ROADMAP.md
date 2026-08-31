# WORK_ROADMAP — 전체 작업 스케줄
> 기준일: 2026-08-31
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
| 🟢 코드 정리 필요 | 0건 (미사용 코드 4건, ItemCard.tsx 로직 정리 2건, console.error 정리, CLAUDE.md 파일 구조 업데이트 완료) |
| 🆕 신규 기능 대기 | 0건 (스플래시 화면, 로딩 스피너 완료) |
| 예상 총 소요 | 전체 14개 작업 완료 |

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
