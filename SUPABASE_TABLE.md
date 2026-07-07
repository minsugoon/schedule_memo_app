# SUPABASE_TABLE — DB 테이블 구조

> 기준일: 2026-07-07
> 출처: Supabase SQL Query 직접 추출 (실제 DB 기준, CSV 재추출로 검증)

## 0. 코드에서 실제 사용 중인 테이블

- `schedules`, `tabs` — `lib/hooks/useSchedules.ts`, `lib/hooks/useTabs.ts`에서 전체 CRUD로 사용 중.
- `tab_labels`, `user_settings` — **테이블은 존재하지만 현재 코드에서 읽거나 쓰지 않음.**
  다국어 탭 이름과 서버 동기화 테마/언어 설정은 미구현 상태이며, 테마는 여전히
  `localStorage('memo_theme')`로만 관리된다 (§5 참고). 이 두 테이블을 실제로 연동하려면
  별도 훅(`useUserSettings` 등)과 UI가 필요하다.
- 데이터 갱신 방식: Realtime 구독 없음. 수동 새로고침 버튼과 각 CRUD 작업 직후 refetch로
  동기화한다 (멀티 디바이스 실시간 반영은 아직 없음).

---

## 1. 테이블 관계도

```
auth.users
  ├── user_settings  (1:1)   language / theme / updated_at
  ├── tabs           (1:N)   name, tab_type, sort_order, is_default, color, icon
  │     └── tab_labels (복합PK: tab_id + language)  다국어 이름
  └── schedules      (1:N)   tab_id 연결, started_at / ended_at / is_all_day
```

---

## 2. `schedules` — 일정/메모 데이터

| 컬럼           | 타입        | Not Null | 기본값              | 설명                                    |
| -------------- | ----------- | -------- | ------------------- | --------------------------------------- |
| `id`           | uuid        | ✅       | `gen_random_uuid()` | PK (자동 생성)                          |
| `user_id`      | uuid        | ✅       | —                   | `auth.users.id` 참조 (소유자)           |
| `tab_id`       | uuid        | —        | `null`              | `tabs.id` 참조. null이면 미분류         |
| `started_at`   | timestamptz | —        | `null`              | 시작 날짜+시간                          |
| `ended_at`     | timestamptz | —        | `null`              | 종료 날짜+시간. null이면 하루 일정      |
| `is_all_day`   | boolean     | ✅       | `true`              | true=날짜만 표시, false=시간도 표시     |
| `date_raw`     | text        | ✅       | `''`                | 시작일 입력 원문 (예: `0609`, `6월9일`) |
| `date_end_raw` | text        | ✅       | `''`                | 종료일 입력 원문 (예: `06.20`)          |
| `memo`         | text        | ✅       | —                   | 메모 내용 (50자 이내)                   |
| `is_done`      | boolean     | ✅       | `false`             | 완료 여부                               |
| `sort_order`   | integer     | ✅       | `0`                 | 동일 날짜 내 수동 순서 조정용           |
| `created_at`   | timestamptz | ✅       | `now()`             | 생성 시각 (자동)                        |
| `updated_at`   | timestamptz | ✅       | `now()`             | 수정 시각 (트리거 자동 갱신)            |

**정렬 기준:** `started_at` 오름차순, `null`은 뒤로 (`nullsFirst: false`)

**tab_id 동작 규칙:**

- `메모 탭 id` → 날짜 없이 메모만 입력한 항목
- `개인/회사/커스텀 탭 id` → 해당 탭의 일정
- `null` → 미분류 (탭 미배정 상태)

**클라이언트 타입 매핑 (`lib/types.ts` → `ScheduleItem`):**

| `ScheduleItem` 필드 | DB 컬럼                                        |
| ------------------- | ---------------------------------------------- |
| `dateRaw`           | `date_raw`                                     |
| `dateEndRaw`        | `date_end_raw`                                 |
| `memo`              | `memo`                                         |
| `done`              | `is_done`                                      |
| `startedAt`         | `started_at`                                   |
| `endedAt`           | `ended_at`                                     |
| `isAllDay`          | `is_all_day`                                   |
| `date` / `dateEnd`  | `started_at` / `ended_at` 파싱값 (`parseDate`) |
| `tabId`             | `tab_id` (그대로 저장, uuid 직접 비교용)       |

> **`category` 필드는 제거됨.** 탭 판별·필터링·뱃지 색상은 전부 `tabId === tabs[].id` 직접 비교로 처리하며, 표시용 이름/색상/타입은 `tabId`로 `tabs`를 찾아서 가져온다.

---

## 3. `tabs` — 사용자 정의 탭

| 컬럼         | 타입        | Not Null | 기본값              | 설명                                       |
| ------------ | ----------- | -------- | ------------------- | ------------------------------------------- |
| `id`         | uuid        | ✅       | `gen_random_uuid()` | PK (자동 생성)                             |
| `user_id`    | uuid        | ✅       | —                   | `auth.users.id` 참조 (소유자)              |
| `name`       | text        | ✅       | —                   | 탭 이름 (예: 전체, 개인, 회사, 메모) — 사용자가 자유롭게 변경 가능 |
| `color`      | text        | —        | `null`              | 탭 색상 HEX (예: `#5DCAA5`)                |
| `icon`       | text        | —        | `null`              | 아이콘명 (예: `ti-user`)                   |
| `sort_order` | integer     | ✅       | `0`                 | 탭 표시 순서 (낮을수록 왼쪽)               |
| `is_default` | boolean     | ✅       | `false`             | true=기본 탭 (삭제/이름변경 불가)          |
| `created_at` | timestamptz | ✅       | `now()`             | 생성 시각 (자동)                           |
| `tab_type`   | text        | —        | `null`              | 고정 enum: `all` / `personal` / `work` / `memo` / `null`(커스텀 탭) |

**기본 탭 sort_order 기준:**

| 탭 이름 | sort_order | is_default | tab_type   | 역할                                  |
| ------- | ---------- | ---------- | ---------- | ------------------------------------- |
| 전체    | 0          | true       | `all`      | 탭 바 첫 번째 (날짜 있는 항목만 표시) |
| 개인    | 1          | true       | `personal` | 탭 바 두 번째                         |
| 회사    | 2          | true       | `work`     | 탭 바 세 번째                         |
| 메모    | 99         | true       | `memo`     | 탭 바 독립 버튼 (날짜 없는 항목 전용) |

**⚠️ 주의사항 (2026-07-03 업데이트로 방식 변경):**

- ~~`tabs[0]` / `tabs[1]` 인덱스로 구분~~ → 폐기
- ~~`tabs.find(t => t.name === '개인')` 처럼 `name` 기준으로 탐색~~ → 폐기 (이름은 사용자가 바꿀 수 있어서 매핑이 깨짐)
- **현재 방식:** `tabs.find(t => t.tab_type === 'personal')` 처럼 고정 enum인 `tab_type` 기준으로 탐색. 이름을 바꿔도 매핑이 깨지지 않음
- 일정↔탭 매칭 자체는 `schedules.tab_id === tabs.id` (uuid) 직접 비교로 처리 — `tab_type`은 "개인/회사/전체/메모" 같은 **특수 탭을 찾을 때만** 사용
- 커스텀(사용자 추가) 탭은 `tab_type = null`
- `is_default: true` 탭은 삭제 불가, 이름 변경 불가 처리 필수

---

## 4. `tab_labels` — 탭 다국어 이름

| 컬럼       | 타입 | Not Null | 기본값 | 설명                               |
| ---------- | ---- | -------- | ------ | ---------------------------------- |
| `tab_id`   | uuid | ✅ (PK)  | —      | `tabs.id` 참조                     |
| `language` | text | ✅ (PK)  | —      | 언어 코드 (`ko`, `en`, `ja`, `zh`) |
| `label`    | text | ✅       | —      | 해당 언어의 탭 이름                |

**PK:** (`tab_id`, `language`) 복합 키

**언어별 기본 탭 이름:**

| 탭   | ko   | en       | ja     | zh     |
| ---- | ---- | -------- | ------ | ------ |
| 전체 | 전체 | All      | すべて | 全部   |
| 개인 | 개인 | Personal | 個人   | 个人   |
| 회사 | 회사 | Work     | 会社   | 公司   |
| 메모 | 메모 | Memo     | メモ   | 备忘录 |

---

## 5. `user_settings` — 사용자 환경 설정 (1:1)

| 컬럼         | 타입        | Not Null | 기본값              | 설명                               |
| ------------ | ----------- | -------- | ------------------- | ---------------------------------- |
| `id`         | uuid        | ✅       | `gen_random_uuid()` | PK                                 |
| `user_id`    | uuid        | ✅       | —                   | `auth.users.id` 참조 (UNIQUE)      |
| `language`   | text        | ✅       | `'ko'`              | 언어 설정 (`ko`, `en`, `ja`, `zh`) |
| `theme`      | text        | ✅       | `'light'`           | 테마 (`light`, `dark`)             |
| `updated_at` | timestamptz | ✅       | `now()`             | 수정 시각 (트리거 자동 갱신)       |

> **참고:** 현재 테마는 `localStorage('memo_theme')`로 관리되며
> `user_settings.theme`과 실시간 동기화는 미구현 상태.

---

## 6. SUPABASE_TABLE.md vs 기존 문서 차이점

| 항목                       | 기존 문서          | 실제 DB (2026-07-02 업데이트) |
| -------------------------- | ------------------ | ------------------------------ |
| `schedules.date_end_raw`   | 누락               | ✅ 추가                        |
| `schedules.sort_order`     | 누락               | ✅ 추가                        |
| `schedules.updated_at`     | 누락               | ✅ 추가                        |
| `tabs.name`                | 누락               | ✅ 추가                        |
| `tabs.color`               | 누락               | ✅ 추가                        |
| `tabs.icon`                | 누락               | ✅ 추가                        |
| `tabs.created_at`          | 누락               | ✅ 추가                        |
| `tab_labels.label`         | name으로 잘못 기재 | ✅ label로 수정                |
| `user_settings.id`         | 누락               | ✅ 추가                        |
| `user_settings.updated_at` | 누락               | ✅ 추가                        |
| 탭 매핑 방식               | index 기준         | name 기준으로 수정 권장         |

### 2026-07-03 업데이트 (CSV 재추출 반영)

| 항목                | 기존 문서       | 실제 DB (이번 업데이트)                                          |
| ------------------- | --------------- | ----------------------------------------------------------------- |
| `tabs.tab_type`      | 없음            | ✅ 신규 컬럼 추가 (`all`/`personal`/`work`/`memo`/`null`)         |
| `ScheduleItem.category` | 존재 (문서 §2) | ✅ 필드 완전 제거 — `tabId` 직접 비교로 대체                      |
| 탭 매핑 방식         | `name` 기준     | ✅ `tab_type` 기준으로 교체 (이름 변경에도 매핑 안 깨짐)           |
| 일정↔탭 매칭         | (문서화 안 됨)   | ✅ `schedules.tab_id === tabs.id` (uuid) 직접 비교로 명시           |
