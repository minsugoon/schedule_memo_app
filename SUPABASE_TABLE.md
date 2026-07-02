# SUPABASE_TABLE — DB 테이블 구조

> 기준일: 2026-07-02
> 출처: Supabase SQL Query 직접 추출 (실제 DB 기준)

---

## 1. 테이블 관계도

```
auth.users
  ├── user_settings  (1:1)   language / theme / updated_at
  ├── tabs           (1:N)   name, sort_order, is_default, color, icon
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
| `category`          | `tab_id`가 가리키는 탭의 `name` 기준으로 추론  |

---

## 3. `tabs` — 사용자 정의 탭

| 컬럼         | 타입        | Not Null | 기본값              | 설명                                 |
| ------------ | ----------- | -------- | ------------------- | ------------------------------------ |
| `id`         | uuid        | ✅       | `gen_random_uuid()` | PK (자동 생성)                       |
| `user_id`    | uuid        | ✅       | —                   | `auth.users.id` 참조 (소유자)        |
| `name`       | text        | ✅       | —                   | 탭 이름 (예: 전체, 개인, 회사, 메모) |
| `color`      | text        | —        | `null`              | 탭 색상 HEX (예: `#5DCAA5`)          |
| `icon`       | text        | —        | `null`              | 아이콘명 (예: `ti-user`)             |
| `sort_order` | integer     | ✅       | `0`                 | 탭 표시 순서 (낮을수록 왼쪽)         |
| `is_default` | boolean     | ✅       | `false`             | true=기본 탭 (삭제/이름변경 불가)    |
| `created_at` | timestamptz | ✅       | `now()`             | 생성 시각 (자동)                     |

**기본 탭 sort_order 기준:**

| 탭 이름 | sort_order | is_default | 역할                                  |
| ------- | ---------- | ---------- | ------------------------------------- |
| 전체    | 0          | true       | 탭 바 첫 번째 (날짜 있는 항목만 표시) |
| 개인    | 1          | true       | 탭 바 두 번째                         |
| 회사    | 2          | true       | 탭 바 세 번째                         |
| 메모    | 99         | true       | 탭 바 독립 버튼 (날짜 없는 항목 전용) |

**⚠️ 주의사항:**

- `tabs[0]` / `tabs[1]` 인덱스로 개인/회사를 구분하는 방식은 불안정
- 반드시 `tabs.find(t => t.name === '개인')` 처럼 `name` 기준으로 탐색할 것
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

| 항목                       | 기존 문서          | 실제 DB (이번 업데이트)    |
| -------------------------- | ------------------ | -------------------------- |
| `schedules.date_end_raw`   | 누락               | ✅ 추가                    |
| `schedules.sort_order`     | 누락               | ✅ 추가                    |
| `schedules.updated_at`     | 누락               | ✅ 추가                    |
| `tabs.name`                | 누락               | ✅ 추가                    |
| `tabs.color`               | 누락               | ✅ 추가                    |
| `tabs.icon`                | 누락               | ✅ 추가                    |
| `tabs.created_at`          | 누락               | ✅ 추가                    |
| `tab_labels.label`         | name으로 잘못 기재 | ✅ label로 수정            |
| `user_settings.id`         | 누락               | ✅ 추가                    |
| `user_settings.updated_at` | 누락               | ✅ 추가                    |
| 탭 매핑 방식               | index 기준         | ✅ name 기준으로 수정 권장 |
