# INPUT_COLLAPSE_REPORT — InputSection 접기/펼치기 기능 도입 탐색 보고서

> 목적: InputSection(일정/메모 입력 영역) 접기(collapse)/펼치기(expand) 기능을 추가하기 위한 사전 코드 구조 탐색.
> 코드 수정 없음 — 탐색 및 보고만 수행.
> 대상 파일: `app/_components/ScheduleApp.tsx`, `app/_components/InputSection.tsx`, `app/_components/TabBar.tsx`, `app/globals.css`
> 기준: 2026-09-04 (CLAUDE.md / PROJECT_SPEC.md 최신 상태 기준)

---

## 1. InputSection 현재 구조

### 1-1. ScheduleApp.tsx에서 InputSection 렌더링 위치

**파일:** `app/_components/ScheduleApp.tsx`
**위치:** 486~493번째 줄

```tsx
{viewMode === 'memo' ? (
  <MemoView ... />
) : (
  <>
    <InputSection
      currentTab={currentTab}
      tabs={tabs}
      onAdd={handleAddItem}
      onHelp={(type) => setHelpType(type)}
    />
    <ItemList ... />
  </>
)}
```

**내용:** `InputSection`은 `viewMode === 'tabs'`(일정 탭 화면)일 때만 렌더링되며, `<>...</>` 프래그먼트로 `ItemList`와 형제(sibling) 관계로 나란히 배치됩니다. `viewMode === 'memo'`(메모 뷰)일 때는 `InputSection` 자체가 언마운트되고 `MemoView`가 대신 렌더링됩니다(`MemoView`는 자체 빠른 추가 입력 UI를 내장하고 있어 별개 컴포넌트).

**판단:** InputSection과 ItemList가 부모 컨테이너 없이 `#app` 아래 직속 형제로 배치되어 있고, 이 둘을 감싸는 별도 wrapper div가 없습니다. `#app`은 `display: flex; flex-direction: column`(globals.css:44)이므로, InputSection 앞뒤 형제 요소(AppHeader, TabBar, ItemList)들과 함께 세로 flex 흐름에 직접 참여합니다. 접기 기능을 넣을 때 InputSection만 개별적으로 `height`/`max-height`를 조절해도 다른 형제 요소 레이아웃에는 영향 없이 독립적으로 동작 가능합니다. 다만 별도 wrapper가 없으므로, 접기 애니메이션용 wrapper를 새로 추가할지 InputSection 최상단 div에 직접 상태 클래스를 줄지 결정이 필요합니다.

---

### 1-2. InputSection을 감싸는 부모 컨테이너 클래스명

**파일:** `app/_components/ScheduleApp.tsx`
**위치:** 411번째 줄 (`<div id="app">`)

**내용:** `InputSection`의 실질적 부모는 `id="app"` div 하나뿐입니다. `TabBar`(`.tab-bar-wrapper`)나 `ItemList`(`.list-section`)처럼 InputSection 전용 래퍼 클래스는 존재하지 않습니다.

**판단:** 별도 wrapper 클래스가 없으므로, 접기 상태에 따른 스타일 분기(예: `.input-section.collapsed`)를 InputSection 자신의 최상단 클래스에 조건부로 추가하는 방식이 가장 자연스럽습니다. `#app`에 상태를 얹는 방식은 다른 자식 요소(TabBar, ItemList)와 셀렉터가 꼬일 수 있어 권장되지 않습니다.

---

### 1-3. InputSection.tsx 최상단 래퍼 div 클래스명

**파일:** `app/_components/InputSection.tsx`
**위치:** 68번째 줄

```tsx
return (
  <div className="input-section">
    ...
  </div>
);
```

**내용:** 최상단 래퍼는 `className="input-section"` 단일 클래스이며, 조건부 클래스 로직(템플릿 리터럴 등) 없이 고정 문자열입니다. 내부에 모달 3종(DateErrorModal, DatePickerModal, TimePickerModal)과 날짜 줄 2개(`.date-time-row`), 메모 줄(`.memo-input-wrap`), 추가 버튼(`.add-btn`)이 순서대로 배치되어 있습니다.

**판단:** 접기 상태 클래스를 추가하려면 `className={`input-section${collapsed ? ' collapsed' : ''}`}` 형태로 최상단 div를 조건부 클래스로 바꿔야 하며, `collapsed`라는 boolean prop을 InputSection이 새로 받아야 합니다(§4 참고). 모달 3종은 `collapsed` 여부와 무관하게 항상 조건부 렌더링되고 있어(각 `state !== null`), 접힌 상태에서도 모달 자체는 정상 동작 — 다만 접힌 상태에서 모달을 여는 것 자체가 UX상 이상하므로, 접혔을 때는 날짜/시간 입력 필드와 아이콘 버튼을 감춰 모달 오픈 트리거 자체를 차단하는 편이 자연스럽습니다.

---

### 1-4. 현재 InputSection 높이 관련 CSS 존재 여부

**파일:** `app/globals.css`
**위치:** 167번째 줄

```css
.input-section { flex-shrink: 0; padding: 11px var(--pad-h) 10px; border-bottom: 0.5px solid var(--border); background: var(--bg); }
```

**내용:** `.input-section`에 고정 `height`/`max-height`/`transition` 속성이 전혀 없습니다. `flex-shrink: 0`만 지정되어 있어, flex 컨테이너(`#app`) 안에서 내용물 높이만큼 자연스럽게 차지하고 절대 줄어들지 않는 상태입니다(=현재는 항상 "펼쳐진" 높이 고정).

**판단:** 높이 관련 CSS가 전무하므로, 접기 애니메이션을 만들려면 `max-height` + `overflow: hidden` + `transition` 조합을 새로 추가해야 합니다(§5 참고). 기존 스타일과 충돌 요소는 없습니다.

---

## 2. 레이아웃 흐름

### 2-1. #app div 내부 전체 구조

**파일:** `app/_components/ScheduleApp.tsx`
**위치:** 397~519번째 줄 (return 블록)

실제 DOM 순서(조건부 렌더링 포함):

```
<> (최상위 프래그먼트)
  {showSplash && <SplashScreen />}         // #app 형제, #app을 완전히 덮는 별도 레이어
  <div id="app">
    <h2 className="sr-only">              // 스크린리더 전용, 시각적으로 숨김
    {isLoading && <LoadingOverlay />}      // 전체 오버레이
    {toast && <ToastMessage />}            // absolute 위치 토스트
    {showOnboarding && <OnboardingOverlay />}  // 온보딩 오버레이 — 최우선 z-index
    {showPatchNote && <PatchNoteModal />}      // 패치노트 모달 — 최우선 z-index
    {helpType !== null && <HelpModal />}
    <AppHeader />
    <TabBar />
    {viewMode === 'memo'
      ? <MemoView />
      : <><InputSection /><ItemList /></>}
    {showInstallModal && <PWAInstallModal />}
  </div>
</>
```

**내용:** CLAUDE.md/PROJECT_SPEC.md에 기재된 예상 순서(SplashScreen → LoadingOverlay → 모달들 → AppHeader → TabBar → InputSection → ItemList)와 실제 코드 순서가 정확히 일치합니다. 단, `SplashScreen`은 `#app` div 바깥의 형제 요소로 렌더링되고(`#app`을 완전히 덮는 별도 레이어), 나머지(LoadingOverlay/ToastMessage/OnboardingOverlay/PatchNoteModal/HelpModal)는 모두 `#app` 내부에서 `position: absolute` 계열로 겹쳐 표시됩니다(`#app`이 `position: relative`이므로 이들의 기준 컨테이너가 됨, globals.css:50).

**판단:** InputSection과 ItemList는 이 오버레이/모달 레이어들과 무관하게 문서 흐름(flex 자식)에 실제로 존재하는 콘텐츠입니다. 접기 기능 구현 시 이 오버레이 레이어들과 z-index 충돌은 없습니다(오버레이들은 모두 InputSection보다 훨씬 높은 z-index를 별도로 가짐).

---

### 2-2. InputSection과 ItemList 사이 간격/구분 요소

**파일:** `app/globals.css`
**위치:** 167번째 줄(`.input-section` border-bottom), 206~208번째 줄(`.list-section`)

```css
.input-section { ... border-bottom: 0.5px solid var(--border); background: var(--bg); }
...
.list-section {
  flex: 1; overflow-y: auto; padding: 12px var(--pad-h) 16px;
  -webkit-overflow-scrolling: touch;
}
```

**내용:** 둘 사이에 별도의 구분선용 div나 spacer 요소는 없고, `.input-section`의 `border-bottom`이 시각적 구분선 역할을 합니다. 여백은 `.input-section`의 `padding-bottom: 10px`과 `.list-section`의 `padding-top: 12px`가 각자 담당합니다.

**판단:** 접었을 때 `border-bottom`이 남아있으면 접힌 InputSection도 얇은 선 형태로 시각적으로 존재를 유지하게 되어(접기 버튼 자리 등) UX상 오히려 유리할 수 있습니다. 별도 구분 요소가 없어 참조/삭제해야 할 마크업도 없습니다.

---

### 2-3. ItemList의 overflow/scroll 설정 — InputSection이 접혔을 때 자동으로 더 많은 공간을 차지할 수 있는 구조인지

**파일:** `app/globals.css`
**위치:** 40~51번째 줄(`#app`), 206~208번째 줄(`.list-section`)

```css
#app {
  ...
  height: 100dvh;         /* 모바일 뷰포트 기준 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}
...
.list-section {
  flex: 1; overflow-y: auto; padding: 12px var(--pad-h) 16px;
  -webkit-overflow-scrolling: touch;
}
```

데스크톱 미디어쿼리(431px 이상, globals.css:545-548):
```css
@media (min-width: 431px) {
  body { align-items: center; padding-top: 20px; }
  #app { height: var(--app-h); /* 900px 고정 */ border-radius: 16px; overflow: hidden; ... }
}
```

**내용:** `#app`은 뷰포트 높이(`100dvh`, 데스크톱은 고정 `900px`)로 높이가 정해져 있고, `AppHeader`/`TabBar`/`InputSection`은 모두 `flex-shrink: 0`(고정 높이), `.list-section`만 `flex: 1`(나머지 공간 전부 차지) + `overflow-y: auto`입니다.

**판단: 예, 구조적으로 이미 가능합니다.** `#app`이 `display: flex; flex-direction: column`이고 `.list-section`이 `flex: 1`이므로, `InputSection`의 실제 렌더링 높이가 CSS로 줄어들면(예: `max-height`를 0에 가깝게, 혹은 `display: none`) 별도 JS 계산 없이 `.list-section`이 자동으로 그만큼의 여유 공간을 흡수해 넓어집니다. 즉 flex 레이아웃이 이미 "InputSection이 접히면 ItemList가 자동으로 커지는" 전제를 만족하고 있어, 접기 기능 도입 시 `.list-section` 쪽은 별도 수정이 필요 없을 가능성이 높습니다.

---

## 3. 접기/펼치기 버튼 위치 후보

### 3-1. InputSection 내부 하단 우측에 버튼 추가 시 기존 "+ 추가" 버튼과 겹치는지

**파일:** `app/_components/InputSection.tsx` (215~218번째 줄), `app/globals.css` (187~194번째 줄)

```tsx
{/* 추가 버튼 */}
<button className="add-btn" onClick={handleAdd}>
  <IconPlus size={15} aria-hidden /> {btnLabel}
</button>
```
```css
.add-btn {
  background: var(--btn-bg); color: var(--btn-text);
  border: none; border-radius: 9px; padding: 9px; font-size: 15px;
  cursor: pointer; font-weight: 500; width: 100%;
  display: flex; align-items: center; justify-content: center; gap: 5px;
  -webkit-appearance: none;
}
```

**내용:** `.add-btn`은 `width: 100%`로 InputSection 내부 가로 폭 전체를 차지하는 단일 버튼입니다. 별도 flex row로 감싸져 있지 않고 InputSection의 마지막 자식 요소로 단독 배치되어 있습니다.

**판단:** `.add-btn`이 `width: 100%`이므로, "우측 하단"에 접기 버튼을 물리적으로 겹치지 않게 배치하려면 (a) `.add-btn`을 감싸는 flex row를 새로 만들고 접기 버튼을 그 옆에 배치하며 `.add-btn`의 `width`를 `flex: 1`로 바꾸거나, (b) 접기 버튼을 `.add-btn` 영역이 아닌 InputSection 자체의 `position: relative` 기준 `position: absolute` 오버레이로 우상단 등에 배치해야 합니다. 현재 구조 그대로 `.add-btn` 위에 단순히 겹쳐 놓으면 클릭 영역이 충돌합니다 — 레이아웃 변경 없이는 "하단 우측"에 안전하게 추가할 자리가 없습니다.

---

### 3-2. TabBar 하단 영역에 버튼 추가 시 적합한지

**파일:** `app/_components/TabBar.tsx` (84~161번째 줄), `app/globals.css` (550~589번째 줄)

**내용:** `TabBar`는 `.tab-bar-wrapper`(높이 `var(--tab-h)` = 42px 고정, `display: flex; align-items: stretch`) 안에 `.tab-bar-actions`(완료 토글/메모 버튼, 왼쪽)와 `.tab-bar`(탭 목록 + `+` 버튼, 오른쪽)가 가로로 나란히 배치된 구조입니다. "하단"이라는 별도 여백이나 영역은 없고, 컴포넌트 전체가 42px 높이의 단일 가로 바입니다.

**판단:** TabBar 자체에 "하단 영역"이 물리적으로 존재하지 않습니다(높이 42px 고정 바 하나뿐). 만약 "TabBar 바로 아래"를 의미한 것이라면, 그 자리는 곧 `InputSection`의 시작 지점이므로 사실상 InputSection 상단에 버튼을 놓는 것과 동일한 효과입니다. TabBar 내부(`.tab-bar-actions`)에 세 번째 버튼으로 추가하는 것은 기존 `.tab-action-btn` 32×32 패턴과 크기가 맞아 기술적으로는 가능하지만(§ TabBar.tsx 108-126번째 줄, 기존 완료/메모 버튼과 동일 클래스 재사용 가능), 의미상 "탭 전환/필터" 버튼 그룹에 "입력창 접기"라는 다른 성격의 기능이 섞이게 되어 UX 일관성 측면에서는 InputSection 자체에 버튼을 두는 편이 더 적합해 보입니다.

---

### 3-3. 현재 InputSection의 마지막 행 구조 (저장/취소 버튼 위치)

**파일:** `app/_components/InputSection.tsx`
**위치:** 201~218번째 줄

```tsx
{/* 3줄: 메모 */}
<div className="memo-input-wrap">
  <input ... />
  <span className={`memo-char-count ${charClass}`}>{charLen} / 40</span>
</div>

{/* 추가 버튼 */}
<button className="add-btn" onClick={handleAdd}>
  <IconPlus size={15} aria-hidden /> {btnLabel}
</button>
```

**내용:** InputSection에는 "취소" 버튼이 없습니다(입력 후 취소할 폼 상태가 아니라 상시 노출되는 빠른 추가 입력창이므로). 마지막 행은 메모 입력 줄(`.memo-input-wrap`) 다음에 오는 `.add-btn` 하나뿐이며, 이 버튼이 InputSection의 최종(가장 아래) 자식입니다.

**판단:** "저장/취소 버튼 위치" 관련해서는 취소 버튼 자체가 존재하지 않으므로 겹침 문제는 없습니다. 접기 버튼을 넣을 유력한 후보는 오히려 InputSection **최상단**(예: 날짜 줄 위 또는 옆)입니다 — 맨 아래 `.add-btn`과 겹칠 걱정 없이, 접힌 상태에서도 항상 보이는 고정된 트리거 위치가 되기 때문입니다.

---

## 4. 상태 관리 위치

### 4-1. InputSection 접기 상태를 관리하기 좋은 위치 — ScheduleApp.tsx vs InputSection.tsx

**내용:**
- `ScheduleApp.tsx`는 이미 `showPatchNote`, `showOnboarding`, `showInstallModal`, `helpType` 등 UI 토글성 상태를 전부 최상위에서 관리하고 자식에게 props로 내려주는 패턴을 일관되게 쓰고 있습니다(67~92번째 줄).
- `InputSection.tsx`는 현재 폼 입력값(`dateRaw`, `memo` 등)과 모달 오픈 상태(`datePickerTarget` 등)처럼 "이 컴포넌트 안에서만 의미 있는" 로컬 상태만 갖고 있습니다(25~33번째 줄).

**판단:** "접힘 여부"는 InputSection 자신의 입력값과 무관하게, `ItemList`가 공간을 넓혀 쓸지 결정하는 데도 영향을 주는 상태는 아니지만(레이아웃은 CSS/flex로 자동 처리됨, §2-3), 헤더의 다른 버튼(`?`, `📣`)이나 향후 다른 트리거에서 이 상태를 열고 닫을 가능성을 고려하면 **ScheduleApp.tsx에서 관리하고 InputSection에는 `collapsed`(boolean) + `onToggleCollapse`(함수) props로 내려주는 방식이 기존 패턴과 일관됩니다.** 다만 "InputSection 접기"가 순수하게 InputSection 내부에서만 토글되고 다른 컴포넌트가 이 상태를 알 필요가 전혀 없다면, InputSection 로컬 상태(`useState`)로 두는 것도 구조적으로는 문제없습니다 — 최종 선택은 "다른 컴포넌트(AppHeader의 버튼 등)가 이 상태를 트리거/구독해야 하는가"에 달려 있습니다.

---

### 4-2. localStorage로 접기 상태 유지할 경우 기존 키와 충돌 없는지

**파일:** `app/_components/ScheduleApp.tsx`, `app/layout.tsx`
**위치(기존 키 전수 조사 결과):**

| 키 | 사용 위치 |
|---|---|
| `memo_theme` | ScheduleApp.tsx:78, 352 / layout.tsx:20 (플리커 방지 스크립트) |
| `patch_seen_20260702` | ScheduleApp.tsx:86(구 코드, 현재는 제거됨), 372 |
| `pwa_installed` | ScheduleApp.tsx:100, 107, 113, 121, 391 |
| `onboarding_seen_v1` | ScheduleApp.tsx:144, 382 |

**판단:** `input_collapsed` 또는 `input_section_collapsed` 등 신규 키 이름은 기존 4개 키 중 어느 것과도 겹치지 않습니다. 충돌 위험 없음. 단, 새 키를 추가한다면 `PROJECT_SPEC.md` §11(localStorage 사용 표)에도 함께 등록해야 문서-코드 동기화가 유지됩니다(이번 작업 범위 밖이나, 추후 구현 시 반영 필요).

---

## 5. 애니메이션 가능 여부

### 5-1. globals.css에 height 트랜지션 관련 클래스 존재 여부

**파일:** `app/globals.css`
**위치:** 전체 검색 결과, `height`/`max-height` 관련 `transition`은 1043번째 줄 1건만 존재

```css
transition: top 0.2s ease, left 0.2s ease, width 0.2s ease, height 0.2s ease;
```

**내용:** 이 규칙은 `OnboardingOverlay`의 스포트라이트(강조 박스)가 대상 요소를 따라 움직이는 애니메이션용으로, InputSection과 무관한 별개 컴포넌트입니다. `.input-section`, `.list-section`, `.tab-bar-wrapper` 등 오늘 탐색한 클래스 어디에도 `height`/`max-height` 관련 `transition`이 지정되어 있지 않습니다.

**판단:** InputSection 접기 전용 트랜지션은 현재 전무하므로 신규로 작성해야 합니다. 재사용 가능한 기존 애니메이션 인프라는 없습니다(`spin` 키프레임 정도만 존재, 무관).

---

### 5-2. InputSection에 max-height 기반 접기 애니메이션 적용 가능한지

**내용:** `.input-section`은 `flex-shrink: 0`만 있고 `height`/`max-height`가 지정되어 있지 않아 내용물 높이(auto)를 그대로 씁니다(§1-4). 내부 콘텐츠(날짜 줄 2개 + 메모 줄 + 버튼)의 실제 렌더링 높이는 고정값이 아니라 폰트 크기·패딩에 따라 결정되는 auto 높이입니다.

**판단:** 기술적으로 `max-height` 트랜지션 적용은 가능하지만 한 가지 함정이 있습니다 — **`max-height`를 이용한 CSS 트랜지션은 `auto` 높이 사이를 직접 애니메이션할 수 없다는 CSS의 근본 제약**이 있습니다. 일반적인 해결책은 (a) `max-height`에 콘텐츠보다 충분히 큰 임의의 큰 값(예: `500px`)을 목표값으로 주고 `0`과 그 값 사이를 트랜지션하는 방식(근사치이지만 대부분의 경우 시각적으로 자연스러움), 또는 (b) JS로 실제 콘텐츠 높이(`scrollHeight`)를 측정해 인라인 스타일로 적용하는 방식입니다. 현재 InputSection의 내용물이 반응형 폰트 크기(`input[type=text]` 16px 고정 — iOS 줌 방지 규칙, globals.css:180)로 비교적 높이가 일정하므로, (a) 방식(고정 임의값 `max-height`)으로도 실사용상 문제없이 적용 가능할 것으로 판단됩니다. `overflow: hidden`을 `.input-section`에 추가로 지정해야 접히는 동안 내부 콘텐츠가 삐져나오지 않습니다(현재 `.input-section`에는 `overflow` 속성이 없음).

---

## 종합 요약

| 항목 | 결론 |
|---|---|
| InputSection 부모 래퍼 | 없음 (`#app` 직속) → 접기 상태 클래스는 InputSection 자신에 적용 |
| ItemList 자동 확장 | 이미 가능 (`.list-section { flex: 1 }` + `#app` flex column) — 추가 레이아웃 수정 불필요 |
| 버튼 위치 | `.add-btn`이 `width:100%`라 하단 우측에 단순히 겹치는 배치 불가 → 레이아웃 변경 필요. InputSection 최상단(날짜 줄 상단) 배치가 가장 충돌 적음. TabBar 액션 영역도 기술적으로는 가능하나 의미상 어색 |
| 상태 위치 | ScheduleApp.tsx(다른 트리거 연동 대비) 또는 InputSection 로컬 상태(단독 토글이면 충분) — 재사용 범위에 따라 결정 필요 |
| localStorage 키 | 기존 4개(`memo_theme`, `patch_seen_20260702`, `pwa_installed`, `onboarding_seen_v1`)와 충돌 없음, 신규 키 추가 시 PROJECT_SPEC.md §11 갱신 필요 |
| 애니메이션 | 기존 height 트랜지션 인프라 없음, 신규 작성 필요. `auto` 높이 특성상 `max-height` 임의 고정값 + `overflow:hidden` 방식 권장 |

코드 수정 없이 탐색만 수행했습니다.
