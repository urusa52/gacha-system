// revealStateMachine.js — 공개 연출의 "로직"만 담당하는 상태 머신.
// DOM을 전혀 모른다. "지금 몇 번째 페이지가 어느 단계인가"를 관리하고,
// 그리는 방법은 pageView(3단계)가 PAGE_STATE_CHANGED를 구독해서 알아서 한다.
//
// 페이지 하나의 생애:
//   FADED(바랜 백지+잉크 얼룩) → BROKEN(끊긴 문장) → COMPLETING(펜이 이어 쓰는 중) → RESTORED(복원 완료)
//
// 전이 규칙:
//   탭:            FADED → BROKEN,  BROKEN → COMPLETING
//   애니메이션 종료: COMPLETING → RESTORED  (View가 PAGE_ANIM_DONE으로 알림)
//   속독(skip):     모든 페이지 → RESTORED 즉시 점프
//   COMPLETING/RESTORED 상태의 페이지는 탭을 무시한다.

import { EVENTS } from "../eventBus.js";

export const PAGE_STATES = {
  FADED: "FADED",
  BROKEN: "BROKEN",
  COMPLETING: "COMPLETING",
  RESTORED: "RESTORED",
};

// 탭으로 일어나는 전이만 순수 데이터로 분리 — 규칙이 한눈에 보이게.
const TAP_TRANSITIONS = {
  [PAGE_STATES.FADED]: PAGE_STATES.BROKEN,
  [PAGE_STATES.BROKEN]: PAGE_STATES.COMPLETING,
};

export function createRevealStateMachine(bus) {
  let pages = [];        // [{ index, result, state }]
  let revealActive = false; // 중복 REVEAL_ALL_DONE 발행 방지

  function setPageState(page, nextState) {
    if (page.state === nextState) return;
    page.state = nextState;
    bus.emit(EVENTS.PAGE_STATE_CHANGED, {
      pageIndex: page.index,
      state: nextState,
      result: page.result,
    });
    checkAllDone();
  }

  function checkAllDone() {
    if (!revealActive) return;
    if (pages.every((p) => p.state === PAGE_STATES.RESTORED)) {
      revealActive = false;
      bus.emit(EVENTS.REVEAL_ALL_DONE, {
        results: pages.map((p) => p.result),
      });
    }
  }

  // ── 이벤트 구독 (외부와의 유일한 접점) ──

  // 새 복원 결과가 확정되면 페이지들을 FADED로 깔아놓는다.
  bus.on(EVENTS.DRAW_RESOLVED, ({ results }) => {
    revealActive = true;
    // 페이지 상태를 깔기 전에 "새 공개 시작"을 먼저 알린다.
    // View들의 청소가 반드시 초기 상태 수신보다 앞서게 하기 위함 —
    // 같은 이벤트에 대한 구독 순서에 의존하지 않는 명시적 순서 보장.
    bus.emit(EVENTS.REVEAL_STARTED, { count: results.length });
    pages = results.map((result, index) => ({
      index,
      result,
      state: PAGE_STATES.FADED,
    }));
    // 초기 상태도 이벤트로 알린다 — View가 이걸 받아 책상에 페이지를 그린다.
    for (const page of pages) {
      bus.emit(EVENTS.PAGE_STATE_CHANGED, {
        pageIndex: page.index,
        state: page.state,
        result: page.result,
      });
    }
  });

  bus.on(EVENTS.PAGE_TAPPED, ({ pageIndex }) => {
    const page = pages[pageIndex];
    if (!page || !revealActive) return;
    const next = TAP_TRANSITIONS[page.state];
    if (next) setPageState(page, next);
    // COMPLETING/RESTORED는 TAP_TRANSITIONS에 없으므로 자연히 무시된다.
  });

  // View의 "펜 애니메이션 끝났음" 신호 → 복원 확정
  bus.on(EVENTS.PAGE_ANIM_DONE, ({ pageIndex }) => {
    const page = pages[pageIndex];
    if (!page) return;
    // 속독으로 이미 RESTORED가 된 뒤 늦게 도착한 신호는 무시 (setPageState의 동일상태 가드)
    if (page.state === PAGE_STATES.COMPLETING) {
      setPageState(page, PAGE_STATES.RESTORED);
    }
  });

  // 속독: 남은 페이지 전부 즉시 복원
  bus.on(EVENTS.SKIP_PRESSED, () => {
    if (!revealActive) return;
    for (const page of pages) {
      setPageState(page, PAGE_STATES.RESTORED);
    }
  });

  // 테스트/디버그용 스냅샷 (복사본)
  return {
    snapshot: () => pages.map((p) => ({ index: p.index, state: p.state })),
    isActive: () => revealActive,
  };
}
