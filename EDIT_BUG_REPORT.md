# EDIT_BUG_REPORT — 카드 수정 모드 날짜/시간 표시 버그 탐색 보고서

> 기준일: 2026-09-01
> 탐색 범위: `app/_components/ItemCard.tsx`, `lib/dateUtils.ts`, `lib/types.ts`
> (교차 확인을 위해 `app/_components/ScheduleApp.tsx`, `lib/hooks/useSchedules.ts`, `SUPABASE_TABLE.md`도 함께 참조)
> 본 문서는 코드 수정 없이 탐색만 수행한 결과입니다.

---

## 1. 수정 모드 날짜 표시 형식

### editDate 초기값
파일: `app/_components/ItemCard.tsx`
위치: 59번째 줄
내용: `setEditDate(item.dateRaw || '');` — `item.dateRaw`를 그대로 사용.

`item.dateRaw`의 출처: `app/_components/ScheduleApp.tsx` 44~59번째 줄 `toScheduleItem()`의 48번째 줄 `dateRaw: row.date_raw` — DB `schedules.date_raw` 컬럼(사용자가 입력한 원문, 예: `'0905'`)을 가공 없이 그대로 사용.
문제: 없음 — 저장 시(§4 참고)에도 `date_raw`에 사용자가 입력한 원문 문자열이 그대로 저장되므로, 입력→저장→재표시 전 구간에서 원문이 보존됨.

### editDateEnd 초기값
파일: `app/_components/ItemCard.tsx`
위치: 60번째 줄
내용: `setEditDateEnd(item.dateEndRaw || '');` — `item.dateEndRaw`를 그대로 사용.

`item.dateEndRaw`의 출처: `app/_components/ScheduleApp.tsx` 50번째 줄 `dateEndRaw: isoToDateRaw(row.ended_at)` — **`row.date_end_raw`(DB 원문 컬럼)를 쓰지 않고**, 38~42번째 줄의 `isoToDateRaw()` 함수로 `ended_at`(ISO 타임스탬프)를 `'YYYY-MM-DD'` 형식 문자열로 **재조립**해서 사용.

```ts
// app/_components/ScheduleApp.tsx 38~42번째 줄
function isoToDateRaw(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}
```

**문제(원인 확정):** 시작일은 사용자가 입력한 원문(`date_raw`)을 그대로 보여주는 반면, 종료일은 ISO 타임스탬프에서 역산한 `'YYYY-MM-DD'` 형식으로 보여주기 때문에 서로 다른 형식이 노출됩니다. `SUPABASE_TABLE.md` §2에는 `schedules.date_end_raw`라는 원문 보존용 컬럼이 이미 존재한다고 문서화되어 있으나(`text NOT NULL DEFAULT ''`), §4에서 확인한 바와 같이 **이 컬럼은 애플리케이션 코드 어디에서도 쓰이지 않습니다.** `date_raw`와 대칭되는 컬럼이 있음에도 활용되지 않아, 대신 `ended_at`으로부터 재조립한 값을 쓰는 우회 로직이 생긴 것으로 보입니다.

---

## 2. 수정 모드 시간 표시

### editTime 초기값
파일: `app/_components/ItemCard.tsx`
위치: 64~65번째 줄
내용:
```ts
const st = item.isAllDay === false ? extractTime(item.startedAt) : null;
setEditTime(st ? `${String(st.h).padStart(2, '0')}:${String(st.m).padStart(2, '0')}` : '');
```
`item.isAllDay === false`일 때만 `extractTime(item.startedAt)`으로 시간을 추출해 `HH:MM` 형식으로 설정.
문제: 없음(스크린샷의 '10:00' 정상 표시와 일치).

### editTimeEnd 초기값
파일: `app/_components/ItemCard.tsx`
위치: 67~68번째 줄
내용:
```ts
const et = (item.isAllDay === false && isRange(item)) ? extractTime(item.endedAt) : null;
setEditTimeEnd(et ? `${String(et.h).padStart(2, '0')}:${String(et.m).padStart(2, '0')}` : '');
```

**문제(원인 확정):** `isRange(item)` 게이트가 있어야만 `item.endedAt`에서 종료시간을 추출합니다. `isRange()`의 실제 정의(`lib/dateUtils.ts` 66~68번째 줄)는:
```ts
export function isRange(it: ScheduleItem): boolean {
  return !!(it.dateEnd && dateKey(it.dateEnd) !== dateKey(it.date));
}
```
즉 **시작일과 종료일이 "다른 날짜"일 때만 `true`**를 반환합니다. 사용자가 같은 날 안에서 시작시간~종료시간만 입력한 경우(예: 09-05 10:00 ~ 09-05 15:00), `dateKey(dateEnd) === dateKey(date)`이므로 `isRange()`는 `false`가 되고, `et`는 무조건 `null`이 되어 `editTimeEnd`가 빈 문자열로 초기화됩니다 — **`item.endedAt`에 실제로 유효한 종료시간이 저장되어 있어도 무시됩니다.** `isRange()`는 원래 "날짜 범위 여부"를 판별하기 위한 함수인데, "종료시간 표시 여부" 판단에도 재사용되면서 같은 날 시간 범위 케이스를 놓치는 것이 이 버그의 직접 원인입니다.

**부가 발견:** `extractTime()`(`lib/dateUtils.ts` 219~226번째 줄)은 `h === 0 && m === 0`이면 `null`을 반환합니다(자정을 "시간 없음"으로 간주). 종료시간이 정확히 자정(00:00)인 경우도 같은 방식으로 빈 값이 되는 별도의 엣지 케이스이나, 스크린샷 시나리오(10:00 시작)와는 무관해 보입니다.

---

## 3. lib/dateUtils.ts 함수 목록 확인

| 함수 | 존재 여부 | 위치 | 확인 내용 |
|---|---|---|---|
| `parseDate()` | ✅ 존재 | 10~41번째 줄 | 문자열 → `ScheduleDate \| null`. `YYYY-MM-DD`, `YYMMDD`, `YYYYMMDD`, `M-D`, `M월 D일`, `YYYY년 M월 D일`, `MMDD` 등 7개 정규식 패턴 순차 매칭 |
| `fmtShort()` | ✅ 존재 | 45~51번째 줄 | `ScheduleDate` → `{text, dayType}`. `06월 09일(금)` 형식(0 패딩 있음). 주석상 "현재 카드 표시에는 미사용, 유틸로만 유지"(PROJECT_SPEC.md 기준과 일치) |
| `fmtShortNoPad()` | ✅ 존재 | 229~234번째 줄 | `ScheduleDate` → `6월 9일(금)` 형식(0 패딩 없음). `fmtDateLine()` 내부에서 실제 카드 날짜 표시에 사용됨 |
| `extractTime()` | ✅ 존재 | 219~226번째 줄 | ISO 문자열 → `{h, m} \| null`. `getUTCHours()`/`getUTCMinutes()` 사용, `00:00`은 `null` 처리 |
| `fmtTime()` | ✅ 존재 | 146~155번째 줄 | `(h, m)` → `'오전/오후 H:MM'` 문자열 |
| `calcDayDiff()` | ✅ 존재 | 168~174번째 줄 | 오늘 자정 기준 `target`과의 일수 차이(반올림) |
| `fmtDateLine()` | ✅ 존재 | 257~319번째 줄 | 카드 날짜줄 포맷. `isAllDay` 여부 × 당일/범위 4가지 케이스 분기, 내부적으로 `isSameDate()`(245~251번째 줄, 비공개 헬퍼)로 같은 날 여부를 별도로 재계산 |

7개 함수 모두 존재하며 구현되어 있음을 확인했습니다.

---

## 4. 수정 모드 저장 시 날짜 파싱 흐름

### 저장 호출 경로
파일: `app/_components/ItemCard.tsx`
위치: 142~150번째 줄 (`handleTabSelected`)
내용: 날짜/시간이 있는 저장은 `onSaveEditWithTime(item.id, editDate, editTime, editDateEnd, editTimeEnd, trimmed, tabId)` 호출 → 부모(`ScheduleApp.tsx`)의 `handleSaveEditWithTime`으로 연결.

### ScheduleApp.tsx의 파싱/저장
파일: `app/_components/ScheduleApp.tsx`
위치: 257~312번째 줄 (`handleSaveEditWithTime`)
내용:
- `parseDate(dateRaw)` → `parsed`(시작일), `parseDate(dateEndRaw)` → `parsedEnd`(종료일)
- 301~308번째 줄에서 `updateSchedule(schedule.id, { tab_id, date_raw: dateRaw, memo, started_at, ended_at, is_all_day })` 호출

**문제(원인 확정, §1과 동일 뿌리):** 이 `updateSchedule` 호출 객체에 **`date_end_raw` 필드가 아예 없습니다.** `editDateEnd`(사용자가 수정 모드에서 입력한 종료일 원문)는 `parseDate()`로 `ended_at` 계산에만 쓰이고, DB의 `date_end_raw` 컬럼에는 저장되지 않습니다.

교차 확인 결과, 이는 `updateSchedule` 함수 자체의 타입 제약 때문입니다:
파일: `lib/hooks/useSchedules.ts`
위치: 6~17번째 줄(`DbSchedule` 타입), 19~26번째 줄(`AddScheduleInput`), 28~35번째 줄(`UpdateScheduleInput`)
내용: 세 타입 모두 `date_raw`는 있지만 **`date_end_raw` 필드가 정의되어 있지 않습니다.** 65~74번째 줄의 `addSchedule` INSERT 페이로드, 85~99번째 줄의 `updateSchedule` UPDATE 페이로드 어디에도 `date_end_raw`를 쓰는 코드가 없습니다.

`handleSaveEdit`(238~255번째 줄, 시간 없는 저장 경로)도 247번째 줄에 `date_raw: dateRaw`만 있고 `date_end_raw`는 없어 동일한 패턴입니다.

### 저장 후 item 값 갱신 경로
`updateSchedule` 성공 시 `lib/hooks/useSchedules.ts` 97번째 줄에서 `fetchSchedules()`를 호출해 전체 목록을 DB에서 재조회 → `ScheduleApp.tsx`의 `schedules` state가 갱신 → 154~157번째 줄 `useMemo`가 `toScheduleItem()`으로 재매핑 → `item.dateRaw`는 방금 저장한 `date_raw`(사용자가 입력한 원문)로 정확히 갱신되지만, `item.dateEndRaw`는 다시 `isoToDateRaw(ended_at)`로 **재조립**되므로 저장 직후에도 사용자가 입력했던 종료일 원문 형식이 아닌 `'YYYY-MM-DD'` 형식으로 되돌아갑니다.

---

## 5. 하루 일정(시작일=종료일) 판별 로직

| 위치 | 별도 처리 여부 | 내용 |
|---|---|---|
| `ItemCard.tsx` 수정 모드 저장 시(`handleSaveClick` 100~125번째 줄, `handleTabSelected` 142~150번째 줄) | ❌ 없음 | `editDate`/`editDateEnd`를 가공 없이 그대로 `onSaveEditWithTime`에 전달. 시작일=종료일인지 비교하는 로직 없음 |
| `ScheduleApp.tsx` `handleSaveEditWithTime`(257~312번째 줄) | ❌ 없음 | `parsed`/`parsedEnd`를 독립적으로 계산·저장. 두 날짜가 같은지 비교해 병합하거나 `ended_at`을 `null` 처리하는 분기 없음 |
| `lib/dateUtils.ts` `fmtDateLine()`(257~319번째 줄) | ✅ 있음 | 275~283번째 줄(종일 일정), 300~307번째 줄(시간 있는 일정) 두 곳에서 비공개 헬퍼 `isSameDate()`(245~251번째 줄)로 시작일=종료일 여부를 판별해 **카드에 날짜를 한 번만 표시**하도록 처리 |

**설계 불일치 발견:** "같은 날짜 여부" 판별 로직이 코드베이스에 **두 군데 따로** 존재합니다 — `isRange()`(`dateKey()` 문자열 비교, §2에서 다룬 버그의 원인)와 `fmtDateLine()` 내부의 `isSameDate()`(y/m/d 필드 직접 비교, 비공개 헬퍼라 재사용 불가). 카드의 날짜 표시 자체는 `isSameDate()` 덕분에 정상적으로 "당일 일정"으로 병합되어 보이지만, 수정 모드 폼 초기화는 `isRange()`를 쓰기 때문에 같은 종일-여부 판단이 화면 위치마다 다르게 동작하는 것으로 파악됩니다.

---

## 추가 확인 — 스크린샷 재현 경로

| 필드 | 입력값 | 화면 표시 | 원인 |
|---|---|---|---|
| 시작일 | `'0905'` | `'0905'` (원문 그대로) | §1 — `editDate = item.dateRaw`이며 `date_raw` 컬럼은 원문을 그대로 저장/재사용하므로 정상 |
| 종료일 | `'2026-09-05'`처럼 ISO 형식 노출 | `editDateEnd = item.dateEndRaw`인데, `dateEndRaw`는 §1에서 확인한 `isoToDateRaw(ended_at)`로 **매번 재조립**되어 항상 `'YYYY-MM-DD'` 형식으로 나옴 — 사용자가 실제로 무엇을 입력했든 상관없이 이 형식으로 고정 표시됨 (§1, §4) |
| 시작시간 | `'10:00'` | `'10:00'` (정상) | §2 — `item.isAllDay === false`이면 `extractTime(item.startedAt)`으로 정상 추출 |
| 종료시간 | 입력함 | input이 비어있음 | §2 — 시작일과 종료일이 같은 날짜인 경우 `isRange(item)`이 `false`를 반환해 `editTimeEnd` 초기화 로직 자체가 스킵됨(값이 있어도 무시) |

**결론:** 이번 스크린샷 시나리오(같은 날짜에 시작/종료 시간만 다르게 입력)에서 재현되는 두 증상(종료일 ISO 노출, 종료시간 소실)은 **서로 다른 두 버그**이지만 공통된 뿌리를 가집니다 — 둘 다 "종료일이 시작일과 같은 날인 케이스"를 코드 여러 곳(§1의 미사용 `date_end_raw` 컬럼, §2의 `isRange()` 오용)에서 제대로 다루지 못하는 데서 비롯됩니다.

---

## 참고 — 수정 방향에 대한 메모 (구현은 하지 않음)

- §1: `date_end_raw` 컬럼을 `AddScheduleInput`/`UpdateScheduleInput`/`DbSchedule` 타입에 추가하고 저장/조회 양쪽에서 실제로 읽고 쓰도록 배선하면, `date_raw`와 대칭적으로 원문이 보존되어 `isoToDateRaw()` 우회 로직을 제거할 수 있을 것으로 보입니다.
- §2: `editTimeEnd` 초기화 조건을 `isRange(item)` 대신 "`item.endedAt`이 존재하고 `isAllDay === false`인지"로 바꾸면(즉 날짜 범위 여부가 아니라 시간 값의 존재 여부로 판단), 같은 날 시간 범위 케이스에서도 종료시간이 정상적으로 채워질 것으로 보입니다.

본 문서는 탐색·보고 목적으로만 작성되었으며 코드 수정은 포함하지 않았습니다.
