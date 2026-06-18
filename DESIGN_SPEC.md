# DESIGN_SPEC — 할 일 메모장 디자인 기술서

> 기준일: 2026-06-18  
> 대상: `globals.css` + `app/_components/` 전체 컴포넌트

---

## 1. 디자인 철학

| 원칙 | 내용 |
|------|------|
| 모바일 우선 | 430px 고정 캔버스, 터치 친화적 인터랙션 |
| 한국어 최적화 | 한글 폰트 우선 스택, 날짜·시간 한국식 표기 |
| 미니멀 | CSS 변수 기반 단일 색상 시스템, 불필요한 장식 없음 |
| 다크 모드 | `data-theme="dark"` 속성 전환, 플리커 없는 SSR 대응 |

---

## 2. 레이아웃 & 치수

```
┌─────────────────────────────────┐  max-width: 430px
│           AppHeader             │  height: 82px
│  (헤더: 타이틀 + 버튼 + 날짜/시계)  │
├─────────────────────────────────┤
│             TabBar              │  height: 42px
│    (전체 / 개인 / 회사 탭 바)    │
├─────────────────────────────────┤
│          InputSection           │  height: 148px
│  (시작일 / 종료일 / 메모 / 버튼)  │
├─────────────────────────────────┤
│           ItemList              │  flex: 1 (나머지 전체)
│       (스크롤 카드 목록)         │
└─────────────────────────────────┘  전체 높이: 640px
```

| CSS 변수 | 값 | 설명 |
|---|---|---|
| `--app-max` | `430px` | 앱 최대 너비 |
| `--app-h` | `640px` | 앱 고정 높이 |
| `--pad-h` | `18px` | 좌우 기본 패딩 |
| `--header-h` | `82px` | 헤더 영역 높이 |
| `--tab-h` | `42px` | 탭 바 높이 |
| `--input-h` | `148px` | 입력 영역 높이 |

**데스크톱 (431px 이상):** `padding-top: 20px`, `border-radius: 16px`, `box-shadow: 0 4px 28px rgba(0,0,0,0.1)`

---

## 3. 색상 시스템

### 3-1. CSS 변수 — 라이트 모드 (`:root`)

| 변수 | 값 | 용도 |
|---|---|---|
| `--bg` | `#FAFAF8` | 앱 배경 |
| `--bg2` | `#F3F2EE` | 헤더·탭바 배경 |
| `--bg3` | `#E8E7E2` | 호버·뱃지 배경 |
| `--text` | `#2C2C2A` | 주요 텍스트 |
| `--text2` | `#5F5E5A` | 보조 텍스트 |
| `--text3` | `#888780` | 흐린 텍스트, 플레이스홀더 |
| `--border` | `#D3D1C7` | 기본 테두리 |
| `--border2` | `#B4B2A9` | 강조 테두리, 포커스 |
| `--today-bg` | `#FFFBEA` | 오늘 항목 배경 |
| `--today-border` | `#FAC775` | 오늘 항목 테두리 |
| `--done-text` | `#B4B2A9` | 완료 항목 텍스트 |
| `--btn-bg` | `#2C2C2A` | 주요 버튼 배경 |
| `--btn-text` | `#FAFAF8` | 주요 버튼 텍스트 |
| `--del` | `#A32D2D` | 삭제 버튼 색 |
| `--edit-c` | `#185FA5` | 수정 버튼 색 |
| `--check-done` | `#639922` | 완료 체크박스 색 |
| `--input-bg` | `#FFFFFF` | 입력 필드 배경 |
| `--card-bg` | `#FFFFFF` | 카드 배경 |

### 3-2. CSS 변수 — 다크 모드 (`[data-theme="dark"]`)

| 변수 | 값 | 변경 내용 |
|---|---|---|
| `--bg` | `#1E1E1C` | 앱 배경 (훨씬 어두움) |
| `--bg2` | `#2C2C2A` | 헤더·탭바 |
| `--bg3` | `#3A3A38` | 호버 |
| `--text` | `#E8E7E2` | 주요 텍스트 (반전) |
| `--text2` | `#B4B2A9` | 보조 텍스트 |
| `--border` | `#444441` | 테두리 |
| `--border2` | `#5F5E5A` | 강조 테두리 |
| `--today-bg` | `#2A2510` | 오늘 배경 (어두운 노란빛) |
| `--today-border` | `#BA7517` | 오늘 테두리 |
| `--done-text` | `#5F5E5A` | 완료 텍스트 |
| `--btn-bg` | `#E8E7E2` | 버튼 배경 (반전) |
| `--btn-text` | `#1E1E1C` | 버튼 텍스트 (반전) |
| `--del` | `#F09595` | 삭제 (밝게 조정) |
| `--edit-c` | `#85B7EB` | 수정 (밝게 조정) |
| `--check-done` | `#97C459` | 체크 (밝게 조정) |
| `--input-bg` | `#2C2C2A` | 입력 배경 |
| `--card-bg` | `#2C2C2A` | 카드 배경 |

### 3-3. 카테고리 색상 (하드코딩)

| 카테고리 | 도트 색 | 뱃지 배경 (라이트) | 뱃지 텍스트 (라이트) | 뱃지 배경 (다크) | 뱃지 텍스트 (다크) |
|---|---|---|---|---|---|
| 개인 (personal) | `#5DCAA5` | `#E1F5EE` | `#0F6E56` | `#085041` | `#9FE1CB` |
| 회사 (work) | `#378ADD` | `#E6F1FB` | `#185FA5` | `#0C447C` | `#B5D4F4` |

### 3-4. 글자 수 카운터 색상 (하드코딩)

| 범위 | 클래스 | 색상 |
|---|---|---|
| 0 ~ 40자 | `.char-ok` | `var(--text3)` (#888780) |
| 41 ~ 50자 | `.char-warn` | `#BA7517` |
| 51자 이상 | `.char-over` | `#A32D2D` |

---

## 4. 타이포그래피

```css
font-family: -apple-system, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
```

| 요소 | 크기 | 굵기 | 색상 변수 | 비고 |
|---|---|---|---|---|
| 앱 타이틀 | 16px | 500 | `--text` | `.title` |
| 탭 라벨 | 12px | 400 / 500(활성) | `--text3` / `--text` | `.tab-item` |
| 탭 뱃지 | 10px | — | `--text3` / `--bg` | `.tab-count` |
| 날짜 표시 | 12px | — | `--text2` | `.today-date` |
| 시계 표시 | 12px | — | `--text3` | `.today-time`, tabular-nums |
| 메모 라벨 | 11px | — | `--text3` | `.memo-label` |
| 글자 수 | 11px | — | 조건부 | `.char-count` |
| 입력 필드 | 13px | — | `--text` | `input[type=text]` |
| 추가 버튼 | 13px | 500 | `--btn-text` | `.add-btn` |
| 카드 날짜 | 11px | — | `--text3` | `.item-date-line`, tabular-nums |
| 카드 메모 | 13px | — | `--text` | `.item-memo-line` |
| 오늘 뱃지 | 10px | 500 | `#4A1B0C` / `#FAF0D8` | `.today-badge` |
| 카테고리 뱃지 | 10px | 500 | 카테고리별 | `.cat-badge` |

> **tabular-nums:** 시계(`.today-time`)와 카드 날짜(`.item-date-line`)는 `font-variant-numeric: tabular-nums` 적용 — 숫자 너비를 고정해 흔들림 방지

---

## 5. 컴포넌트별 디자인 상세

### 5-1. AppHeader

```
┌─────────────────────────────────────────┐
│  📋 할 일 메모장     [🔄] [🌙 어둠] [⬛ 로그아웃] │  ← header-top
│  2026년 06월 18일 (목)  14:32:07              │  ← today-info
└─────────────────────────────────────────┘
```

**클래스 구조:**
- `.header` — `background: var(--bg2)`, `border-bottom: 0.5px solid var(--border)`, `padding: 14px 18px 12px`
- `.header-top` — `flex; justify-content: space-between; align-items: center; margin-bottom: 6px`
- `.title` — 16px, weight 500
- `.theme-btn` — `border: 0.5px solid var(--border2)`, `border-radius: 8px`, `padding: 4px 10px`, `font-size: 11px`, 호버 시 `background: var(--bg3)`
- `.today-info` — `align-items: baseline; gap: 8px`
- `.today-date` — 12px, `var(--text2)`
- `.today-time` — 12px, `var(--text3)`, tabular-nums

**버튼 목록 (우상단, 조건부 렌더링):**
1. `🔄 새로고침` — `onRefresh` prop 존재 시. 로딩 중 `animate-spin` 적용
2. `🌙 어둠 / ☀️ 밝음` — 항상 표시. Tabler `IconMoon` / `IconSun` (13px)
3. `로그아웃` — `onSignOut` prop 존재 시. Tabler `IconLogout` (13px)

---

### 5-2. TabBar

```
┌──────────┬──────────┬──────────┐
│  전체 [5] │  개인 [3] │  회사 [2] │   height: 42px
└──────────┴──────────┴──────────┘
     ↑ 활성 탭: 굵은 텍스트 + 하단 2px 실선
```

**클래스 구조:**
- `.tab-bar` — `display: flex; height: 42px; overflow-x: auto; scrollbar-width: none`
- `.tab-item` — `flex: 1; font-size: 12px; border-bottom: 2px solid transparent; transition: 0.15s`
- `.tab-item.active` — `font-weight: 500; border-bottom: 2px solid var(--text)`
- `.tab-count` — `font-size: 10px; background: var(--bg3); border-radius: 10px; padding: 0 5px; line-height: 16px`
- `.tab-item.active .tab-count` — `background: var(--text); color: var(--bg)` (반전)

**탭 순서:** 전체(all) → 개인(personal) → 회사(work)

---

### 5-3. InputSection

```
┌──────────────────┬──────────────────┐
│  시작일 (0609…)   │  종료일 (선택)    │  ← date-row (gap: 7px)
└──────────────────┴──────────────────┘
 메모                              0 / 50   ← memo-label-row
┌─────────────────────────────────────┐
│  할 일 메모 (50자 이내)               │  ← memo input
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  +  개인 일정 추가 (Enter)            │  ← add-btn
└─────────────────────────────────────┘
```

**클래스 구조:**
- `.input-section` — `padding: 11px 18px 10px; border-bottom: 0.5px solid var(--border)`
- `.date-row` — `display: flex; gap: 7px; margin-bottom: 6px` (각 input `flex: 1`)
- `input[type=text]` — `background: var(--input-bg); border: 0.5px solid var(--border); border-radius: 9px; padding: 9px 11px; font-size: 13px`
- `input:focus` — `border-color: var(--border2)`
- `.memo-label-row` — `justify-content: space-between; margin-bottom: 3px`
- `.add-btn` — `background: var(--btn-bg); border-radius: 9px; padding: 9px; width: 100%; display: flex; align-items: center; gap: 5px`

**추가 버튼 라벨 로직:**
- `all` 탭 → `"추가 (개인 탭에 저장)"`
- `personal` 탭 → `"개인 일정 추가 (Enter)"`
- `work` 탭 → `"회사 일정 추가 (Enter)"`

**키보드 흐름:** 시작일 `Enter` → 종료일 포커스 → `Enter` → 메모 포커스 → `Enter` → 저장

---

### 5-4. ItemCard

**카드 상태 조합:**

| 상태 | 클래스 조합 | 시각 효과 |
|---|---|---|
| 기본 | `.item` | 흰 배경, `border: 0.5px solid var(--border)` |
| 오늘(미완료) | `.item.today-item` | `background: var(--today-bg)`, `border-color: var(--today-border)` |
| 완료 | `.item.done-item` | `opacity: 0.68`, 메모 취소선, 날짜·메모 모두 `--done-text` |
| 확장(아이콘 표시) | `.item.expanded` | 수정/삭제 아이콘 오버레이 노출 |
| 편집 중 | `.item.expanded` + `editing` | 아이콘 오버레이 + 하단 인라인 편집 폼 |

**카드 내부 구조:**
```
.item
└── .item-main
    ├── .check-box (체크박스)
    └── .item-body-col
        ├── .item-lines
        │   ├── .item-date-line  (날짜 텍스트)
        │   └── .item-memo-line  (메모, 텍스트 오버플로우 ellipsis)
        └── .item-badge-col
            ├── .cat-badge       (전체 탭에서만 표시)
            └── .today-badge     (오늘+미완료일 때만 표시)
.item-icons (확장 시 오버레이)
    ├── .icon-btn.edit-btn  (IconPencil 15px)
    └── .icon-btn.del-btn   (IconTrash 15px)
.edit-row (편집 중에만 렌더)
    ├── .edit-date-inp
    ├── .edit-end-inp
    ├── .edit-memo-inp
    └── .edit-save
```

**체크박스:**
- 기본: `width: 19px; height: 19px; border: 1.5px solid var(--border2); border-radius: 5px`
- 호버: `border-color: var(--check-done)`
- 완료: `background: var(--check-done); border-color: var(--check-done)` + 흰색 체크 SVG 표시

**아이콘 오버레이:**
- 위치: `absolute; right: 9px; top: 50%; transform: translateY(-50%)`
- 배경: `var(--card-bg)` / 오늘 항목은 `var(--today-bg)`
- `border: 0.5px solid var(--border); border-radius: 8px; padding: 2px`
- 아이콘 버튼: `width: 28px; height: 28px; border-radius: 5px`
- 수정: `color: var(--edit-c)` / 삭제: `color: var(--del)`

**인라인 편집 폼:**
- `border-top: 0.5px solid var(--border); margin-top: 9px; padding-top: 9px`
- 날짜 입력 `flex: 1; min-width: 80px` / 메모 입력 `flex: 2; min-width: 110px`
- 저장 버튼: `background: var(--btn-bg); border-radius: 7px; padding: 6px 12px; font-size: 12px`

---

### 5-5. ItemList

- `.list-section` — `flex: 1; overflow-y: auto; padding: 12px 18px 16px; -webkit-overflow-scrolling: touch`
- 스크롤바: `width: 3px`, `background: var(--border)`, `border-radius: 3px`
- 빈 상태: `.list-empty` — `text-align: center; padding: 40px 0; color: var(--text3); font-size: 13px`

---

## 6. 상태별 시각 처리

| 상태 | 조건 | 처리 |
|---|---|---|
| 오늘 강조 | `isTodayInRange(start, end) && !done` | 배경 `--today-bg`, 테두리 `--today-border`, 날짜 `--text2`, 메모 `font-weight: 500` |
| 완료 처리 | `done === true` | `opacity: 0.68`, 날짜·메모 `color: --done-text`, 메모 `text-decoration: line-through` |
| 호버 | `:hover` | `border-color: var(--border2)` |
| 카드 확장 | click (비-인터랙티브 영역) | `.expanded` 클래스 → 아이콘 오버레이 `display: flex` |
| 오늘 + 완료 | 동시 | 완료 스타일 우선 (today-item 클래스 미적용) |

---

## 7. 테마 시스템

**전환 방식:** `document.documentElement.setAttribute('data-theme', theme)` — `<html>` 요소의 `data-theme` 속성으로 전환

**플리커 방지:** `app/layout.tsx`의 `<head>` 내 인라인 스크립트로 첫 렌더 전에 `localStorage`에서 테마를 읽어 즉시 적용

```html
<script dangerouslySetInnerHTML={{ __html: `
  try {
    var t = localStorage.getItem('memo_theme');
    if (t) document.documentElement.setAttribute('data-theme', t);
  } catch(e) {}
` }} />
```

**localStorage 키:** `memo_theme` — `'light'` | `'dark'`

**SuppressHydrationWarning:** `<html>` 태그에 적용 — 서버/클라이언트 불일치 경고 억제

---

## 8. 인터랙션 패턴

### 입력 흐름
```
시작일 입력 → Enter → 종료일 포커스
종료일 입력 → Enter → 메모 포커스
메모 입력   → Enter → 일정 저장 + 입력 초기화
```

### 카드 인터랙션
```
카드 클릭 (비-인터랙티브 영역) → expanded 토글 (아이콘 오버레이 ON/OFF)
체크박스 클릭  → done 토글 (이벤트 버블링 차단)
연필 아이콘    → 인라인 편집 모드 진입 (메모 input 자동 포커스 + 전체 선택)
휴지통 아이콘  → confirm 후 삭제
인라인 편집 Enter → 저장
```

### 접근성
- 체크박스: `role="checkbox"`, `aria-checked`, `aria-label="완료 체크"`
- 수정 버튼: `aria-label="수정"`
- 삭제 버튼: `aria-label="삭제"`
- 새로고침 버튼: `aria-label="새로고침"`
- 아이콘 `aria-hidden` 처리 (Tabler Icons)
- `.sr-only` 유틸리티 클래스 정의됨

---

## 9. 아이콘 라이브러리

**패키지:** `@tabler/icons-react` v3.44.0

| 아이콘 | 컴포넌트 | 크기 | 사용 위치 |
|---|---|---|---|
| 달 | `IconMoon` | 13px | AppHeader — 다크 모드 전환 버튼 |
| 해 | `IconSun` | 13px | AppHeader — 라이트 모드 전환 버튼 |
| 로그아웃 | `IconLogout` | 13px | AppHeader — 로그아웃 버튼 |
| 플러스 | `IconPlus` | 15px | InputSection — 추가 버튼 |
| 연필 | `IconPencil` | 15px | ItemCard — 수정 버튼 |
| 휴지통 | `IconTrash` | 15px | ItemCard — 삭제 버튼 |

---

## 10. 로그인 화면 (미인증 상태)

로그인 버튼: `.login-btn`

```css
.login-btn {
  background: var(--btn-bg); color: var(--btn-text);
  border-radius: 9px; padding: 12px 24px; font-size: 15px;
  font-weight: 500; width: 100%;
}
/* 호버: opacity 0.85 / 클릭: opacity 0.7 */
```

> AppHeader에서 인증 여부를 확인해 로그아웃 버튼 조건부 렌더링  
> 미인증 시 InputSection 대신 로그인 안내 영역을 표시 (`ScheduleApp.tsx` 내부 분기)
