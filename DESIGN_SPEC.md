# DESIGN_SPEC — 할 일 메모장 디자인 기술서

> 기준일: 2026-09-01 (ROADMAP #18 문서 드리프트 정리)
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
| 41자 이상 | `.char-over` | `#A32D2D` |

> `globals.css`에는 3단계였던 시절의 `.char-warn`(`#BA7517`) 클래스가 여전히 정의돼 있으나,
> `InputSection.tsx`/`ItemCard.tsx`의 실제 판정 로직(`charLen > 40 ? 'char-over' : 'char-ok'`)은
> 40자 기준 2단계만 사용합니다 — `.char-warn`은 코드에서 참조되지 않는 죽은 스타일입니다.

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
┌───────────────────────────────────────────┐
│  📋 할 일 메모장         [?][🔄][🌙][⎋]     │  ← header-top
│  2026년 07월 07일 (화)  14:32:07              │  ← today-info
└───────────────────────────────────────────┘
```

**클래스 구조:**
- `.header` — `background: var(--bg2)`, `border-bottom: 0.5px solid var(--border)`, `padding: 14px 18px 12px`
- `.header-top` — `flex; justify-content: space-between; align-items: center; margin-bottom: 6px`
- `.title` — 17px, weight 500, "📋 할 일 메모장" (제목 앞에 이모지 포함)
- `.header-btns` — 우상단 버튼 그룹, `flex; align-items: center; gap: 4px`
- `.header-btn` — 아이콘 전용 정사각형 버튼 `32×32px`, `border: 0.5px solid var(--border2); border-radius: 8px`,
  호버 시 `background: var(--bg3); color: var(--text)`, 새로고침 로딩 중엔 `.header-btn.spinning`으로
  내부 svg에 `spin` 키프레임 회전 적용 (과거의 텍스트형 `.theme-btn`은 더 이상 사용되지 않음)
- `.today-info` — `align-items: baseline; gap: 8px`
- `.today-date` — 14px, `var(--text2)`
- `.today-time` — 14px, `var(--text3)`, tabular-nums

**버튼 목록 (우상단, 왼쪽부터 순서대로, 모두 `.header-btn` 아이콘 15px):**
1. `IconQuestionMark` — 항상 표시, 온보딩 가이드(`OnboardingOverlay`) 재실행
2. `IconRefresh` — `onRefresh` prop 존재 시. 새로고침 중 `.spinning`으로 회전 애니메이션
3. `IconMoon` / `IconSun` — 항상 표시, 다크/라이트 전환
4. `IconLogout` — `onSignOut` prop 존재 시

---

### 5-2. TabBar + 탭 액션 바 (`.tab-bar-wrapper`)

```
┌────────────┬────┬──────────┬──────────┬──────────┬────┐
│ [완료][메모] │전체[5]│  개인 [3] │  회사 [2] │... │ [+]│  height: 42px
└────────────┴────┴──────────┴──────────┴──────────┴────┘
     ↑ 활성 탭: 굵은 텍스트 + 하단 2px 실선
```

> **DOM/시각 순서 주의:** `TabBar.tsx`에서 `.tab-bar-actions`(완료 보기/메모 뷰 버튼)가
> `.tab-bar`(탭 목록 + 추가 버튼)보다 먼저 렌더링되며, CSS에도 순서를 뒤집는 규칙이 없어
> **왼쪽에 완료/메모 액션 버튼, 오른쪽에 탭 목록+추가 버튼** 순서로 표시됩니다.

**클래스 구조:**
- `.tab-bar-wrapper` — 좌측 액션 버튼(`.tab-bar-actions`) + 탭 스트립(`.tab-bar`)을 감싸는 flex 컨테이너, `height: var(--tab-h)`
- `.tab-bar` — `flex: 1; display: flex; overflow-x: auto; scrollbar-width: none` (탭 5개 이상이면 `.scrollable`로 각 탭 `flex: 0 0 65px` 고정 + `.tab-item.tab-compact`로 폰트/패딩 축소)
- `.tab-item` — `flex: 1; font-size: 14px; border-bottom: 2px solid transparent; transition: 0.15s`
- `.tab-item.active` — `font-weight: 500; border-bottom: 2px solid var(--text)`
- `.tab-count` — `font-size: 12px; background: var(--bg3); border-radius: 10px; padding: 0 5px; line-height: 16px`
- `.tab-item.active .tab-count` — `background: var(--text); color: var(--bg)` (반전)
- `.tab-add-btn` — 탭 추가 버튼(`TabNameModal` 오픈), 탭 스트립 맨 끝에 위치, 탭이 5개 미만일 때만 표시
- `.tab-bar-actions` — 좌측 액션 그룹, `border-right: 0.5px solid var(--border)`로 탭 스트립과 분리
- `.tab-action-btn` — 완료 보기(`IconCircleCheck`)/메모 뷰(`IconNotes`) 토글, 18px 아이콘의 32×32 버튼. `.active`/`.done-on` 상태로 강조
- `.tab-bar.faded` — 메모 뷰 진입 시 탭 바를 흐리게 처리 (`opacity: 0.4; pointer-events: none`)
- 탭 롱프레스(500ms, `is_default`가 아닌 탭만) → `TabNameModal`(`mode: 'edit'`) 오픈

**탭 순서:** `sort_order` 오름차순 (기본: 전체 → 개인 → 회사 → 커스텀 탭들). `memo` 타입 탭은 `TabBar`에서 제외되고 별도 액션 버튼으로 `MemoView`를 토글합니다.

**탭 개수 제한:** 최대 5개(메모 탭 제외), 이름 최대 2자(한글 기준) — `useTabs.ts`에서 강제.

---

### 5-3. InputSection

날짜 행과 시간 행이 **별도의 두 줄**로 분리되어 있으며, 각 입력칸 옆에는
`DatePickerModal`/`TimePickerModal`을 여는 아이콘 버튼이 함께 붙습니다.

```
┌───────────┬──┬───┬───────────┬──┬───┐
│ 시작일  [📅]│~ │   │종료일(선택)[📅]│~ │[?]│  ← date-time-row (1줄, 날짜)
└───────────┴──┴───┴───────────┴──┴───┘
┌───────────┬──┬───┬───────────┬──┬───┐
│시작시간[🕐]│~ │   │종료시간(선택)[🕐]│~ │[?]│  ← date-time-row (2줄, 시간)
└───────────┴──┴───┴───────────┴──┴───┘
                                  0 / 40
┌─────────────────────────────────────┐
│  할 일 메모 (40자 이내)          [12]  │  ← memo-input-wrap (글자수 오버레이)
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  +  개인 일정 추가 (Enter)            │  ← add-btn
└─────────────────────────────────────┘
```

**클래스 구조:**
- `.input-section` — `padding: 11px 18px 10px; border-bottom: 0.5px solid var(--border)`
- `.date-time-row` — 날짜 줄과 시간 줄에 각각 사용, `display: flex; gap: 8px; align-items: center; margin-bottom: 6px`, 구분자 `.row-sep`(예: `~`)
- `.date-input-wrap` — 입력칸 + 피커 아이콘 버튼(`.date-icon-btn`)을 감싸는 wrapper
- `.date-icon-btn` — 날짜 줄엔 `IconCalendar`(14px), 시간 줄엔 `IconClock`(14px). 클릭 시 각각 `DatePickerModal`/`TimePickerModal` 오픈
- `.help-btn` — 날짜 줄/시간 줄 끝에 각각 1개씩 배치(`IconQuestionMark` 14px), 클릭 시 `onHelp('date' | 'time')`로 `HelpModal` 오픈 (날짜용/시간용 도움말이 별도로 존재)
- `input[type=text]` — `background: var(--input-bg); border: 0.5px solid var(--border); border-radius: 9px; padding: 9px 11px; font-size: 16px` (16px 미만이면 iOS에서 자동 확대되므로 유지)
- `input:focus` — `border-color: var(--border2)`
- `.memo-input-wrap` — `position: relative`, 내부 input에 `padding-right: 52px`로 글자수 오버레이 공간 확보
- `.memo-char-count` — `position: absolute; right: 10px; top: 50%; transform: translateY(-50%)`, 색상은 §3-5 기준
- `.add-btn` — `background: var(--btn-bg); border-radius: 9px; padding: 9px; width: 100%; display: flex; align-items: center; gap: 5px`

**추가 버튼 라벨 로직:**
- `all` 탭 → `"추가 (개인 탭에 저장)"`
- 사용자 정의 탭 → `"{탭 이름} 일정 추가 (Enter)"`

**키보드 흐름 (실제 `onKeyDown` 배선 기준):** 시작일/종료일 입력칸에서 Enter → 시작시간으로 포커스 이동
(종료일 칸을 거치지 않고 바로 시간 줄로 건너뜀) → 시작시간 Enter → 종료시간 → 종료시간 Enter →
메모 → 메모 Enter로 저장 + 전체 입력 초기화

---

### 5-4. ItemCard

**카드 상태 조합:**

| 상태 | 클래스 조합 | 시각 효과 |
|---|---|---|
| 기본 | `.item` | 흰 배경, `border: 0.5px solid var(--border)` |
| 오늘(미완료) | `.item.today-item` | `background: var(--today-bg)`, `border-color: var(--today-border)` |
| 완료 | `.item.done-item` | `opacity: 0.68`, 메모 취소선, 날짜·메모 모두 `--done-text` |
| 과거(미완료, 지난 일정) | `.item.past-item` | `opacity: 0.45` |
| 펼침 | `.item.content-expanded` | 메모 전체 표시 + 인라인 수정/삭제 버튼 노출 (아래 "펼치기/접기" 참고) |
| 편집 중 | 카드 내부가 `editing` 분기로 완전히 치환 | 읽기 전용 요약 + 날짜/시간/메모 입력 폼으로 전환 |

**카드 내부 구조 (`ItemCard.tsx` 기준, 실제 렌더 분기):**
```
.item (onClick → handleCardClick, isContentExpanded 토글)
├── editing === true
│   ├── .edit-current-info      (저장된 날짜·메모 읽기 전용 요약)
│   ├── .edit-input-row × 2     (시작/종료 날짜, 시작/종료 시간)
│   ├── .memo-input-wrap        (메모 입력 + .memo-char-count)
│   ├── .edit-action-btn.edit-save-btn / .edit-cancel-btn
│   └── <TabSelectModal>        (저장 클릭 시 날짜/시간 있으면 오픈, 없으면 바로 저장)
└── editing === false
    └── .item-main
        ├── .check-box (체크박스)
        └── .item-body-col
            └── .item-lines
                ├── isContentExpanded === false (접힌 상태)
                │   ├── .item-date-line          (item.date 있을 때만)
                │   └── .item-memo-row
                │       ├── .item-memo-line      (말줄임 ellipsis)
                │       └── .item-badge-col      (오늘/진행중/탭 뱃지)
                ├── isContentExpanded === true && hasDate (펼친 일정 카드)
                │   ├── .item-date-row-expanded
                │   │   ├── .item-date-line
                │   │   └── .item-action-col → .card-action-inline.edit / .del
                │   ├── .item-memo-expanded      (메모 전체 텍스트)
                │   └── .item-badge-bottom       (오늘/진행중/탭 뱃지)
                └── isContentExpanded === true && !hasDate (펼친 메모 카드)
                    ├── .item-memo-row-expanded-no-date
                    │   ├── .item-memo-expanded
                    │   └── .item-action-col → .card-action-inline.edit / .del
                    └── .item-badge-bottom       (탭 뱃지만, showTabBadge일 때)
```

> **구버전 방식은 완전히 삭제됨:** `.item-icons`/`.icon-btn.edit-btn`/`.icon-btn.del-btn`
> (카드 우측에 겹쳐 뜨는 아이콘 오버레이)과 `.item.expanded` 클래스는 더 이상
> `ItemCard.tsx`에서 사용되지 않습니다. `globals.css`에는 해당 규칙이 여전히 남아있지만
> 대응하는 마크업이 없어 죽은 스타일입니다 — 지울 때는 `.item.content-expanded .item-icons`
> 규칙(§296 부근)도 함께 정리해야 합니다.

**펼치기/접기 (`isContentExpanded`):**
- 카드 클릭(체크박스·`.card-action-inline` 제외 영역) → `isContentExpanded` 토글
- `editing`이 `true`가 되는 순간 `isContentExpanded`는 자동으로 `false`로 초기화되고,
  편집 취소(`handleCancelEdit`) 시에도 다시 `false`로 초기화됨
- `item.date` 유무(`hasDate`)로 펼친 레이아웃이 완전히 분기: 날짜가 있으면
  `.item-date-row-expanded`(날짜줄 옆에 버튼), 없으면 `.item-memo-row-expanded-no-date`
  (메모 옆에 버튼)
- 뱃지(오늘/진행중/탭)는 접힌 상태에서는 메모 옆(`.item-badge-col`), 펼친 상태에서는
  하단(`.item-badge-bottom`)으로 이동

**체크박스:**
- 기본: `width: 19px; height: 19px; border: 1.5px solid var(--border2); border-radius: 5px`
- 호버: `border-color: var(--check-done)`
- 완료: `background: var(--check-done); border-color: var(--check-done)` + 흰색 체크 SVG 표시

**인라인 액션 버튼 (`.card-action-inline`):**
- `width: 26px; height: 26px; border-radius: 5px; background: none; border: none`
- 수정: `color: var(--edit-c)`, 아이콘 `IconPencil` 13px / 삭제: `color: var(--del)`, 아이콘 `IconTrash` 13px
- 호버 시 둘 다 `background: var(--bg3)`
- 날짜줄(펼친 일정 카드) 또는 메모 옆(펼친 메모 카드)에 `.item-action-col`로 묶여 배치

**편집 폼 (`.edit-input-row`, `.edit-action-btn`):**
- `.edit-save-btn` — `background: var(--btn-bg); color: var(--btn-text)`
- `.edit-cancel-btn` — `background: var(--bg3); color: var(--text2)`
- 저장 클릭 시 날짜/시간 입력이 하나라도 있으면 `TabSelectModal`을 열어 저장 대상 탭을 확인/변경,
  전부 비어 있으면(메모만 수정) 모달 없이 기존 `tab_id`를 유지한 채 바로 저장

---

### 5-5. ItemList / MemoView

- `.list-section` — `flex: 1; overflow-y: auto; padding: 12px var(--pad-h) 16px; -webkit-overflow-scrolling: touch`
- 스크롤바: `width: 3px`, `background: var(--border)`, `border-radius: 3px`
- 빈 상태: `.list-empty` — `text-align: center; padding: 40px 0; color: var(--text3); font-size: 13px`
- `.memo-view` — `MemoView` 전용 컨테이너, `flex: 1; display: flex; flex-direction: column; overflow: hidden`
- `.memo-view-input` — 상단 빠른 추가 입력 영역(제목 + 카운트 + 입력행), `ItemCard`를 재사용해 목록을 렌더링

---

### 5-6. 모달 공통 패턴

`TabSelectModal`, `TabNameModal`, `HelpModal`, `PatchNoteModal`, `DatePickerModal`, `TimePickerModal`, `DateErrorModal`은 아래 오버레이 패턴을 공유합니다. (`PWAInstallModal`은 §5-7 참고 — 배치만 다르고 나머지 패턴은 동일)

```css
.{prefix}-overlay { position:absolute; inset:0; background:rgba(0,0,0,0.4~0.45); display:flex; align-items:center; justify-content:center; z-index:50~60; padding:20px; }
.{prefix}-card { background:var(--card-bg); border-radius:14px~16px; padding:20px~22px; width:100%; max-width:300~320px; border:0.5px solid var(--border); }
```

- **TabSelectModal** — `.tab-select-option`(탭 목록), 현재 탭엔 `.current` + `.tab-select-current-badge`.
  `ItemCard`의 편집 저장 시(날짜/시간이 하나라도 있을 때) 저장 대상 탭을 확인/변경하는 용도로
  사용되며, 메모에 날짜/시간이 새로 추가되는 경우의 탭 이동도 이 모달 하나로 처리합니다
  (과거 존재했던 `TabMoveModal`은 죽은 코드로 판명되어 삭제됨 — 기능은 `TabSelectModal`로 통합)
- **TabNameModal** — 추천 이름 칩, `.tab-name-confirm-btn`/`.tab-name-cancel-btn`, 기본 탭이 아니면 `.tab-name-delete-btn`(hover 시 연한 빨강 배경)
- **HelpModal** — 별도 오버레이 대신 인풋 하단에 `.help-card`로 인라인 확장, `.help-table`로 입력 형식 예시 표
- **PatchNoteModal** — `.patch-section` 단위로 버전별 변경사항을 `.patch-list`(불릿)로 표시
- **DatePickerModal** — `.datepicker-overlay`/`.datepicker-card`, 달력 그리드(`.datepicker-grid`)로
  날짜 선택, 상단 `.datepicker-header`에 월 이동(`.datepicker-nav-btn`), 하단
  `.datepicker-footer`에 오늘(`.datepicker-today-btn`)/취소(`.datepicker-cancel-btn`) 버튼
- **TimePickerModal** — `.timepicker-overlay`/`.timepicker-card`, 시·분 두 열의 스크롤 휠
  (`.timepicker-wheels` → `.timepicker-col` → `.timepicker-scroll`/`.timepicker-cell`)로
  24시간 형식 시간 선택, 상단에 미리보기 텍스트(`.timepicker-preview`)
- **DateErrorModal** — 날짜/시간 유효성 오류 안내 전용, `IconAlertTriangle` 32px + 메시지 +
  확인 버튼 단일 구성 (별도 클래스 없이 인라인 스타일로 구현되어 있음)

---

### 5-7. 신규 오버레이 컴포넌트 (SplashScreen / LoadingOverlay / ToastMessage / PWAInstallModal)

**SplashScreen** — 앱 최초 진입 시 `authLoading` 동안 표시되는 전체 화면 스플래시
- `position: fixed; inset: 0; z-index: 200` (전체 화면을 덮어야 하므로 유일하게 `fixed`를 쓰는 예외 — PWAInstallModal은 반대로 `absolute`로 바뀌었으니 혼동 주의)
- `background: var(--btn-bg)`, `display: flex; flex-direction: column; align-items: center; justify-content: center`
- 중앙: 📋 이모지(52px) + "할 일 메모장" 타이틀(20px, 600, `var(--btn-text)`) + 부제(13px, opacity 0.75)
- 800ms 유지 후 `opacity 1→0`(0.4s 트랜지션) 페이드아웃, 완료 시 `onFinish` 콜백으로 언마운트

**LoadingOverlay** — tabs/schedules fetch 중(`isLoading = tabsLoading || schedulesLoading`) 표시
- `position: absolute; inset: 0; z-index: 90; background: rgba(0,0,0,0.3)`
- 중앙에 `IconLoader2`(32px, 흰색) + `.loading-spinner` 클래스로 `spin` 키프레임 회전 애니메이션

**ToastMessage** — 저장/수정/삭제 성공·실패 피드백, `.toast-message` 클래스
- `position: absolute; top: 60px; left: 50%; transform: translateX(-50%); z-index: 80`
- `border-radius: 10px; padding: 10px 18px; font-size: 13px; font-weight: 500; white-space: nowrap; pointer-events: none`
- 색상은 인라인 스타일로 지정: 성공 `background #E8F5E9 / color #2E7D32`(2초 후 자동 소멸),
  실패 `background #FCEBEB / color #A32D2D`(3초 후 자동 소멸)

**PWAInstallModal** — 홈 화면 추가 유도
- **`position: absolute`** (다른 대부분의 모달과 동일한 규칙) — 과거 `position: fixed`였던 것이
  데스크톱에서 `#app`(430px) 밖 전체 뷰포트를 덮는 문제로 `absolute`로 수정됨
- `inset: 0; z-index: 50; background: rgba(0,0,0,0.45); backdrop-filter: blur(4px)`
- `beforeinstallprompt` 이벤트를 캐치해 표시, `localStorage.pwa_installed`로 재노출 여부 제어

---

## 6. 상태별 시각 처리

| 상태 | 조건 | 처리 |
|---|---|---|
| 오늘 강조 | `isTodayInRange(start, end) && !done` | 배경 `--today-bg`, 테두리 `--today-border`, 날짜 `--text2`, 메모 `font-weight: 500` |
| 완료 처리 | `done === true` | `opacity: 0.68`, 날짜·메모 `color: --done-text`, 메모 `text-decoration: line-through` |
| 과거 처리 | 지난 날짜 & 미완료 | `opacity: 0.45` (`.past-item`) |
| 호버 | `:hover` | `border-color: var(--border2)` |
| 카드 펼침 | click (체크박스·`.card-action-inline` 제외 영역) | `isContentExpanded` 토글 → `.item.content-expanded`, 메모 전체 표시 + 인라인 수정/삭제 버튼 노출 |
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
카드 클릭 (비-인터랙티브 영역) → isContentExpanded 토글 (펼치기/접기, 재클릭 시 원복)
체크박스 클릭  → done 토글 (이벤트 버블링 차단)
연필 아이콘(.card-action-inline.edit, 펼친 상태에서만 노출) → 인라인 편집 모드 진입
휴지통 아이콘(.card-action-inline.del, 펼친 상태에서만 노출) → confirm 후 삭제
편집 저장      → 날짜/시간 있으면 TabSelectModal 오픈 → 탭 확인/변경 후 최종 저장
              → 날짜/시간 없으면(메모만 수정) 모달 없이 기존 탭 유지한 채 바로 저장
편집 취소      → isContentExpanded false로 초기화하며 편집 폼 종료
```

### 탭 인터랙션
```
탭 클릭        → 해당 탭으로 필터 전환
탭 롱프레스     → TabNameModal (이름 수정/삭제)
탭 추가 버튼    → TabNameModal (신규 탭 생성, 추천 이름 칩 제공)
메모에 날짜 추가 → TabSelectModal (이동할 실제 탭 선택 — 과거 TabMoveModal 기능 통합)
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
| 연필 | `IconPencil` | 13px | ItemCard — 펼친 카드의 `.card-action-inline.edit` 수정 버튼 |
| 휴지통 | `IconTrash` | 13px / 14px | ItemCard `.card-action-inline.del`(13px), TabNameModal 삭제 버튼(14px) |
| 로딩 | `IconLoader2` | 32px | LoadingOverlay — fetch 중 회전 스피너 |
| 경고 | `IconAlertTriangle` | 32px | DateErrorModal — 날짜/시간 유효성 오류 안내 |

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
