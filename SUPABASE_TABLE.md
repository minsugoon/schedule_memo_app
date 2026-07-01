# SUPABASE_TABLE — DB 테이블 구조

> 기준일: 2026-07-02
> 출처: `lib/hooks/useSchedules.ts`, `lib/hooks/useTabs.ts`, `CLAUDE.md`

---

## 1. 테이블 관계도

```
auth.users
  ├── user_settings  (1:1)   language / theme
  ├── tabs           (1:N)   sort_order, is_default
  │     └── tab_labels (복합PK: tab_id + language)  다국어 이름
  └── schedules      (1:N)   tab_id 연결, started_at / ended_at / is_all_day
```

---

## 2. `schedules`

일정/메모 데이터. `tab_id`가 `null`이면 "전체" 탭에 속하지 않는 메모 항목으로 취급됩니다.

| 컬럼 | 타입 | Not Null | 기본값 | 설명 |
|---|---|---|---|---|
| `id` | uuid | ✅ | — | PK |
| `user_id` | uuid | ✅ | — | `auth.users.id` 참조, 소유자 |
| `tab_id` | uuid \| null | — | `null` | `tabs.id` 참조. `null`이면 메모(날짜 없는 항목) |
| `started_at` | timestamptz | ✅ | — | 시작 일시 |
| `ended_at` | timestamptz \| null | — | `null` | 종료 일시. `null`이면 하루짜리 일정 |
| `is_all_day` | boolean | ✅ | `true` | `true`면 시간 미표시(날짜만) |
| `date_raw` | text | ✅ | — | 사용자가 입력한 날짜 원문 (예: `0609`, `6월9일`) |
| `memo` | text | ✅ | — | 메모 내용, 50자 이내 |
| `is_done` | boolean | ✅ | `false` | 완료 여부 |
| `created_at` | timestamptz | ✅ | `now()` | 생성 시각 |

**정렬 기준:** `started_at` 오름차순, `null`은 뒤로 (`nullsFirst: false`)

**클라이언트 접근 패턴 (`useSchedules.ts`):**
- 조회: 전체 또는 `tab_id` 기준 필터링
- 추가: 로그인 세션의 `user_id` 자동 주입, `is_done: false` 기본
- 수정: `tab_id` / `started_at` / `ended_at` / `is_all_day` / `date_raw` / `memo` 부분 업데이트
- 완료 토글: `is_done` 반전
- 삭제: `id` 기준 삭제

---

## 3. `tabs`

사용자별 탭(카테고리) 목록.

| 컬럼 | 타입 | Not Null | 기본값 | 설명 |
|---|---|---|---|---|
| `id` | uuid | ✅ | — | PK |
| `user_id` | uuid | ✅ | — | `auth.users.id` 참조, 소유자 |
| `sort_order` | integer | ✅ | — | 탭 정렬 순서 |
| `is_default` | boolean | ✅ | `false` | 기본 제공 탭 여부 (삭제 불가) |

**클라이언트 접근 패턴 (`useTabs.ts`):**
- 조회: `sort_order` 오름차순
- 추가: 최대 10개까지, `sort_order`는 현재 개수, `is_default: false`로 생성 → 생성 직후 `tab_labels`에 이름 insert
- 순서 변경: `orderedIds` 배열 인덱스로 `sort_order` 일괄 upsert
- 삭제: `is_default`가 `true`인 탭은 삭제 불가

**주의:** 앱 로직상 `tabs[0]` = 개인(personal), `tabs[1]` = 회사(work) 탭으로 매핑됩니다 (`ScheduleApp.tsx`의 `tabCategoryMap`).

---

## 4. `tab_labels`

탭의 다국어 이름. 복합 PK.

| 컬럼 | 타입 | Not Null | 기본값 | 설명 |
|---|---|---|---|---|
| `tab_id` | uuid | ✅ (PK) | — | `tabs.id` 참조 |
| `language` | text | ✅ (PK) | `'ko'` | 언어 코드 (예: `ko`) |
| `name` | text | ✅ | — | 해당 언어의 탭 이름 |

**PK:** (`tab_id`, `language`) 복합 키

---

## 5. `user_settings`

사용자별 환경 설정 (1:1). 현재 코드에서는 직접 조회/수정하는 훅이 없으며, 테마는 `localStorage`(`memo_theme`)로 관리됩니다.

| 컬럼 | 타입 | Not Null | 기본값 | 설명 |
|---|---|---|---|---|
| `user_id` | uuid | ✅ (PK) | — | `auth.users.id` 참조 |
| `language` | text | — | `'ko'` | 사용자 언어 설정 |
| `theme` | text | — | `'light'` | 사용자 테마 설정 (`light` \| `dark`) |

---

## 6. 참고: 클라이언트 타입 매핑

`lib/types.ts`의 `ScheduleItem`은 `schedules` 테이블 row(`DbSchedule`, `lib/hooks/useSchedules.ts`)를 UI용으로 변환한 형태입니다.

| `ScheduleItem` 필드 | 대응 DB 컬럼 |
|---|---|
| `dateRaw` | `date_raw` |
| `memo` | `memo` |
| `done` | `is_done` |
| `startedAt` | `started_at` |
| `endedAt` | `ended_at` |
| `isAllDay` | `is_all_day` |
| `date` / `dateEnd` | `started_at` / `ended_at`을 파싱한 값 (`parseDate`) |
| `category` | `tab_id`가 가리키는 탭이 `tabs[0]`(개인) / `tabs[1]`(회사)인지로 추론 |
