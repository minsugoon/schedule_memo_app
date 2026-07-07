# DESIGN_SPEC — 할 일 메모장 디자인 기술서

> 기준일: 2026-07-07
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
│        TabBar (+ 액션 바)        │  height: 42px
│ (동적 탭들 + 탭추가/완료보기/메모)   │
├─────────────────────────────────┤
│    InputSection / MemoView 입력  │  가변 높이
│ (시작/종료 날짜·시간 / 메모 / 버튼) │
├─────────────────────────────────┤
│         ItemList / MemoView      │  flex: 1 (나머지 전체)
│         (스크롤 카드 목록)         │
└─────────────────────────────────┘  전체 높이: 900px
```

| CSS 변수 | 값 | 설명 |
|---|---|---|
| `--app-max` | `430px` | 앱 최대 너비 |
| `--app-h` | `900px` | 앱 고정 높이 |
| `--pad-h` | `18px` | 좌우 기본 패딩 |
| `--header-h` | `82px` | 헤더 영역 높이 |
| `--tab-h` | `42px` | 탭 바 높이 |
| `--input-h` | `148px` | 입력 영역 참고 높이(콘텐츠에 따라 가변) |

**데스크톱 (431px 이상):** `padding-top: 20px`, `border-radius: 16px`, `box-shadow: 0 4px 28px rgba(0,0,0,0.1)`

> `ViewMode`(`'tabs' | 'memo'`)에 따라 `InputSection`+`ItemList` 조합 또는 `MemoView` 단독 화면으로 전환됩니다.

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

### 3-3. 탭 타입 뱃지 색상 (하드코딩, `.cat-badge.tab-type-*`)

> **`category` 필드는 제거되었습니다.** 아래 색상은 `tabId`로 찾은 탭의 `tab_type`에 따라 적용됩니다.
> `custom`(사용자 추가 탭)은 고정 색 대신 중립 톤(`--bg3`/`--text2`)을 사용합니다.

| 탭 타입 | 도트 색 | 뱃지 배경 (라이트) | 뱃지 텍스트 (라이트) | 뱃지 배경 (다크) | 뱃지 텍스트 (다크) |
|---|---|---|---|---|---|
| personal | `#5DCAA5` | `#E1F5EE` | `#0F6E56` | `#085041` | `#9FE1CB` |
| work | `#378ADD` | `#E6F1FB` | `#185FA5` | `#0C447C` | `#B5D4F4` |
| custom (사용자 정의 탭) | `--text3` | `--bg3` | `--text2` | `--bg3` | `--text2` |

### 3-4. 오늘/진행중 뱃지 색상 (`.item-badge`, `getBadgeInfo` 결과 반영)

| 뱃지 | 클래스 | 배경 (라이트) | 텍스트 (라이트) | 배경 (다크) | 텍스트 (다크) |
|---|---|---|---|---|---|
| 오늘 | `.today-badge-v2` | `#FAC775` | `#4A1B0C` | `#BA7517` | `#FAF0D8` |
| 진행중 | `.ongoing-badge` | `#E1F5EE` | `#0F6E56` | `#073D2C` | `#9FE1CB` |

> 구버전 `.today-badge`(단일 오늘 뱃지 전용 클래스)도 CSS에 남아있으나 카드 렌더링은
> 현재 `getBadgeInfo()` 결과에 따라 `.item-badge` + `.today-badge-v2`/`.ongoing-badge` 조합을 사용합니다.

### 3-5. 글자 수 카운터 색상 (하드코딩)

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
| 앱 타이틀 | 17px | 500 | `--text` | `.title` |
| 탭 라벨 | 14px | 400 / 500(활성) | `--text3` / `--text` | `.tab-item` |
| 탭 뱃지 | 12px | — | `--text3` / `--bg` | `.tab-count` |
| 날짜 표시 | 14px | — | `--text2` | `.today-date` |
| 시계 표시 | 14px | — | `--text3` | `.today-time`, tabular-nums |
| 메모 라벨 | 13px | — | `--text3` | `.memo-label` |
| 글자 수 | 13px | — | 조건부 | `.char-count` |
| 입력 필드 | 16px | — | `--text` | `input[type=text]` (모바일 확대 방지 위해 16px 이상 유지) |
| 추가 버튼 | 15px | 500 | `--btn-text` | `.add-btn` |
| 카드 날짜 | 13px | — | `--text3` | `.item-date-line`, tabular-nums |
| 카드 메모 | 15px | — | `--text` | `.item-memo-line` |
| 탭 타입 뱃지 | 12px | 500 | 탭 타입별 | `.cat-badge` |
| 오늘/진행중 뱃지 | 10px | 500 | §3-4 참고 | `.item-badge` |

> **tabular-nums:** 시계(`.today-time`)와 카드 날짜(`.item-date-line`)는 `font-variant-numeric: tabular-nums` 적용 — 숫자 너비를 고정해 흔들림 방지

---

## 5. 컴포넌트별 디자인 상세

### 5-1. AppHeader

```
┌─────────────────────────────────────────┐
│  할 일 메모장       [🔄] [🌙 어둠] [로그아웃] │  ← header-top
│  2026년 07월 07일 (화)  14:32:07              │  ← today-info
└─────────────────────────────────────────┘
```

**클래스 구조:**
- `.header` — `background: var(--bg2)`, `border-bottom: 0.5px solid var(--border)`, `padding: 14px 18px 12px`
- `.header-top` — `flex; justify-content: space-between; align-items: center; margin-bottom: 6px`
- `.title` — 17px, weight 500
- `.theme-btn` — `border: 0.5px solid var(--border2)`, `border-radius: 8px`, `padding: 4px 10px`, `font-size: 13px`, 호버 시 `background: var(--bg3)`
- `.today-info` — `align-items: baseline; gap: 8px`
- `.today-date` — 14px, `var(--text2)`
- `.today-time` — 14px, `var(--text3)`, tabular-nums

**버튼 목록 (우상단, 조건부 렌더링):**
1. `새로고침` — `onRefresh` prop 존재 시. 로딩 중 `animate-spin` 적용
2. `IconMoon` / `IconSun` — 항상 표시, 다크/라이트 전환 (13px)
3. `IconLogout` — `onSignOut` prop 존재 시 (13px)

---

### 5-2. TabBar + 탭 액션 바 (`.tab-bar-wrapper`)

```
┌────┬──────────┬──────────┬──────────┬────┬────────────┐
│ [+]│  전체 [5] │  개인 [3] │  회사 [2] │... │ [완료][메모]│  height: 42px
└────┴──────────┴──────────┴──────────┴────┴────────────┘
     ↑ 활성 탭: 굵은 텍스트 + 하단 2px 실선
```

**클래스 구조:**
- `.tab-bar-wrapper` — 탭 스트립(`.tab-bar`) + 우측 액션 버튼(`.tab-bar-actions`)을 감싸는 flex 컨테이너, `height: var(--tab-h)`
- `.tab-bar` — `display: flex; overflow-x: auto; scrollbar-width: none` (스크롤 가능 시 `.scrollable`로 각 탭 `flex: 0 0 65px` 고정)
- `.tab-item` — `flex: 1; font-size: 14px; border-bottom: 2px solid transparent; transition: 0.15s`
- `.tab-item.active` — `font-weight: 500; border-bottom: 2px solid var(--text)`
- `.tab-count` — `font-size: 12px; background: var(--bg3); border-radius: 10px; padding: 0 5px; line-height: 16px`
- `.tab-item.active .tab-count` — `background: var(--text); color: var(--bg)` (반전)
- `.tab-add-btn` — 탭 추가 버튼(`TabNameModal` 오픈), `flex: 0 0 36px`
- `.tab-bar-actions` — 우측 액션 그룹, `border-right: 0.5px solid var(--border)`로 탭 스트립과 분리
- `.tab-action-btn` — 완료 보기/메모 뷰 토글 등 32×32 아이콘 버튼. `.active`/`.done-on` 상태로 강조
- `.tab-bar.faded` — 메모 뷰 진입 시 탭 바를 흐리게 처리 (`opacity: 0.4; pointer-events: none`)

**탭 순서:** `sort_order` 오름차순 (기본: 전체 → 개인 → 회사 → 커스텀 탭들). `memo` 타입 탭은 `TabBar`에서 제외되고 별도 액션 버튼으로 `MemoView`를 토글합니다.

**탭 개수 제한:** 최대 5개(메모 탭 제외), 이름 최대 2자(한글 기준) — `useTabs.ts`에서 강제.

---

### 5-3. InputSection

```
┌─────────────┬─────┬─────────────┬─────┐
│  시작일       │시작시간│  종료일(선택) │종료시간│  ← date-time-row
└─────────────┴─────┴─────────────┴─────┘
 메모                                0 / 50   ← memo-label-row
┌─────────────────────────────────────┐
│  할 일 메모 (50자 이내)          [12]  │  ← memo-input-wrap (글자수 오버레이)
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  +  개인 일정 추가 (Enter)            │  ← add-btn
└─────────────────────────────────────┘
```

**클래스 구조:**
- `.input-section` — `padding: 11px 18px 10px; border-bottom: 0.5px solid var(--border)`
- `.date-time-row` — `display: flex; gap: 8px; align-items: center; margin-bottom: 6px`, 구분자 `.row-sep`(예: `~`)
- `input[type=text]` — `background: var(--input-bg); border: 0.5px solid var(--border); border-radius: 9px; padding: 9px 11px; font-size: 16px` (16px 미만이면 iOS에서 자동 확대되므로 유지)
- `input:focus` — `border-color: var(--border2)`
- `.memo-input-wrap` — `position: relative`, 내부 input에 `padding-right: 52px`로 글자수 오버레이 공간 확보
- `.memo-char-count` — `position: absolute; right: 10px; top: 50%; transform: translateY(-50%)`, 색상은 §3-5 기준
- `.add-btn` — `background: var(--btn-bg); border-radius: 9px; padding: 9px; width: 100%; display: flex; align-items: center; gap: 5px`
- `.help-btn` / `.help-spacer` — 입력 필드 옆 도움말 아이콘, 클릭 시 `HelpModal` 오픈

**추가 버튼 라벨 로직:**
- `all` 탭 → `"추가 (개인 탭에 저장)"`
- 사용자 정의 탭 → `"{탭 이름} 일정 추가 (Enter)"`

**키보드 흐름:** 시작일 → 시작시간 → 종료일 → 종료시간 → 메모 → Enter로 저장

---

### 5-4. ItemCard

**카드 상태 조합:**

| 상태 | 클래스 조합 | 시각 효과 |
|---|---|---|
| 기본 | `.item` | 흰 배경, `border: 0.5px solid var(--border)` |
| 오늘(미완료) | `.item.today-item` | `background: var(--today-bg)`, `border-color: var(--today-border)` |
| 완료 | `.item.done-item` | `opacity: 0.68`, 메모 취소선, 날짜·메모 모두 `--done-text` |
| 과거(미완료, 지난 일정) | `.item.past-item` | `opacity: 0.45` |
| 확장(아이콘 표시) | `.item.expanded` | 수정/삭제 아이콘 오버레이 노출 |
| 편집 중 | `.item.expanded` + 인라인 편집 폼 | 아이콘 오버레이 + 하단 편집 폼(날짜/시간/메모) |

**카드 내부 구조:**
```
.item
└── .item-main
    ├── .check-box (체크박스)
    └── .item-body-col
        ├── .item-lines
        │   ├── .item-date-line  (날짜·시간 텍스트)
        │   └── .item-memo-line  (메모, 텍스트 오버플로우 ellipsis)
        └── .item-badge-col
            ├── .cat-badge       (전체 탭에서만 표시, tab-type 색상)
            └── .item-badge      (today-badge-v2 / ongoing-badge, getBadgeInfo 결과)
.item-icons (확장 시 오버레이)
    ├── .icon-btn.edit-btn  (IconPencil 15px)
    └── .icon-btn.del-btn   (IconTrash 15px)
.edit-current-info (편집 진입 시 현재 값 표시)
.edit-input-row (편집 폼: 날짜/시간/메모 입력)
    ├── .edit-save-btn
    └── .edit-cancel-btn
```

편집 저장 시 `TabSelectModal`이 열려 저장 대상 탭을 확인/변경할 수 있습니다.

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

**편집 폼 (`.edit-input-row`, `.edit-action-btn`):**
- `.edit-save-btn` — `background: var(--btn-bg); color: var(--btn-text)`
- `.edit-cancel-btn` — `background: var(--bg3); color: var(--text2)`

---

### 5-5. ItemList / MemoView

- `.list-section` — `flex: 1; overflow-y: auto; padding: 12px var(--pad-h) 16px; -webkit-overflow-scrolling: touch`
- 스크롤바: `width: 3px`, `background: var(--border)`, `border-radius: 3px`
- 빈 상태: `.list-empty` — `text-align: center; padding: 40px 0; color: var(--text3); font-size: 13px`
- `.memo-view` — `MemoView` 전용 컨테이너, `flex: 1; display: flex; flex-direction: column; overflow: hidden`
- `.memo-view-input` — 상단 빠른 추가 입력 영역(제목 + 카운트 + 입력행), `ItemCard`를 재사용해 목록을 렌더링

---

### 5-6. 모달 공통 패턴

`TabSelectModal`, `TabMoveModal`, `TabNameModal`, `HelpModal`, `PatchNoteModal`, `PWAInstallModal`은 아래 오버레이 패턴을 공유합니다.

```css
.{prefix}-overlay { position:absolute; inset:0; background:rgba(0,0,0,0.4~0.45); display:flex; align-items:center; justify-content:center; z-index:50; padding:20px; }
.{prefix}-card { background:var(--card-bg); border-radius:14px; padding:20px; width:100%; max-width:320px; border:0.5px solid var(--border); }
```

- **TabSelectModal** — `.tab-select-option`(탭 목록), 현재 탭엔 `.current` + `.tab-select-current-badge`
- **TabMoveModal** — `.tab-move-preview`로 이동 대상 항목(날짜·메모) 미리보기 후 `.tab-move-option-btn` 목록
- **TabNameModal** — 추천 이름 칩, `.tab-name-confirm-btn`/`.tab-name-cancel-btn`, 기본 탭이 아니면 `.tab-name-delete-btn`(hover 시 연한 빨강 배경)
- **HelpModal** — 별도 오버레이 대신 인풋 하단에 `.help-card`로 인라인 확장, `.help-table`로 입력 형식 예시 표
- **PatchNoteModal** — `.patch-section` 단위로 버전별 변경사항을 `.patch-list`(불릿)로 표시
- **PWAInstallModal** — 홈 화면 추가 유도, `beforeinstallprompt` 이벤트 기반으로 노출 여부 결정

---

## 6. 상태별 시각 처리

| 상태 | 조건 | 처리 |
|---|---|---|
| 오늘 강조 | `isTodayInRange(start, end) && !done` | 배경 `--today-bg`, 테두리 `--today-border`, 날짜 `--text2`, 메모 `font-weight: 500` |
| 완료 처리 | `done === true` | `opacity: 0.68`, 날짜·메모 `color: --done-text`, 메모 `text-decoration: line-through` |
| 과거 처리 | 지난 날짜 & 미완료 | `opacity: 0.45` (`.past-item`) |
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

**localStorage 키:** `memo_theme` — `'light'` | `'dark'` (서버 사이드 `user_settings.theme`과는 아직 동기화되지 않음 — `SUPABASE_TABLE.md` §0 참고)

**suppressHydrationWarning:** `<html>` 태그에 적용 — 서버/클라이언트 불일치 경고 억제

---

## 8. 인터랙션 패턴

### 입력 흐름
```
시작일 → 시작시간 → 종료일(선택) → 종료시간(선택) → 메모 → Enter로 저장 + 입력 초기화
```

### 카드 인터랙션
```
카드 클릭 (비-인터랙티브 영역) → expanded 토글 (아이콘 오버레이 ON/OFF)
체크박스 클릭  → done 토글 (이벤트 버블링 차단)
연필 아이콘    → 인라인 편집 모드 진입 (메모 input 자동 포커스 + 전체 선택)
휴지통 아이콘  → confirm 후 삭제
편집 저장      → TabSelectModal 오픈 → 탭 확인/변경 후 최종 저장
```

### 탭 인터랙션
```
탭 클릭        → 해당 탭으로 필터 전환
탭 롱프레스     → TabNameModal (이름 수정/삭제)
탭 추가 버튼    → TabNameModal (신규 탭 생성, 추천 이름 칩 제공)
메모에 날짜 추가 → TabMoveModal (이동할 실제 탭 선택)
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
| 플러스 | `IconPlus` | 15px | InputSection, TabBar — 추가 버튼 |
| 연필 | `IconPencil` | 15px | ItemCard — 수정 버튼 |
| 휴지통 | `IconTrash` | 15px | ItemCard, TabNameModal — 삭제 버튼 |

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

`app/login/page.tsx`에서 Google OAuth 로그인 버튼과, 이미 로그인된 세션이 있을 때 다른 계정으로
전환할 수 있는 보조 버튼("다른 계정으로 로그인": `signOut` 후 `prompt: 'select_account'`로 재시도)을 제공합니다.

---

## 11. PWA 관련 UI

- `PWAInstallModal` — `beforeinstallprompt` 이벤트를 캐치해 표시, `localStorage.pwa_installed`로 재노출 여부 제어
- 아이콘 세트(72~512px), `manifest.json`, 서비스워커(`public/sw.js`, `workbox-*.js`)는 `@ducanh2912/next-pwa`가 빌드 시 생성
- 개발 모드(`next dev`)에서는 PWA 기능이 비활성화됩니다 (`next.config.ts`의 `disable: process.env.NODE_ENV === 'development'`)
