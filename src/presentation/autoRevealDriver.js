// autoRevealDriver.js — "낭독(朗讀)" 모드.
// 사서가 책상 위 페이지를 첫 장부터 차례로 읽어 내려간다.
//
// 설계 원칙: 상태 머신을 전혀 건드리지 않는다.
// 이 모듈은 사람이 할 탭(PAGE_TAPPED)을 일정한 박자로 대신 쏴줄 뿐이다.
// 덕분에 수동 탭과 낭독이 자연스럽게 공존한다 — 둘 다 같은 이벤트이므로.
//
// 동작: 첫 번째 미복원 페이지를 찾아
//   FADED  → 탭 → brokenPauseMs 만큼 문장을 음미
//   BROKEN → 탭 → (펜이 쓰는 동안 대기)
//   RESTORED 도착 → betweenPagesMs 뒤 다음 장으로
// 속독·전체 완료·새 뽑기 시작 시 자동으로 꺼진다.

import { EVENTS } from "../eventBus.js";
import { PAGE_STATES } from "./revealStateMachine.js";

export function createAutoRevealDriver({ bus, timing }) {
  const pageStates = new Map(); // pageIndex → 상태 (머신 상태의 거울)
  let active = false;
  let timer = null;

  function clearTimer() {
    if (timer) { clearTimeout(timer); timer = null; }
  }

  function setActive(next) {
    if (active === next) return;
    active = next;
    if (!active) clearTimer();
    bus.emit(EVENTS.AUTO_REVEAL_CHANGED, { active });
    if (active) scheduleStep(0);
  }

  /** 인덱스 순서상 가장 앞의 미복원 페이지 */
  function firstPendingIndex() {
    const indices = [...pageStates.keys()].sort((a, b) => a - b);
    return indices.find((i) => pageStates.get(i) !== PAGE_STATES.RESTORED);
  }

  function scheduleStep(delayMs) {
    clearTimer();
    timer = setTimeout(step, delayMs);
  }

  function step() {
    timer = null;
    if (!active) return;
    const idx = firstPendingIndex();
    if (idx === undefined) { setActive(false); return; } // 다 읽었다

    const state = pageStates.get(idx);
    if (state === PAGE_STATES.FADED) {
      bus.emit(EVENTS.PAGE_TAPPED, { pageIndex: idx });
      scheduleStep(timing.brokenPauseMs); // 끊긴 문장을 읽을 시간
    } else if (state === PAGE_STATES.BROKEN) {
      bus.emit(EVENTS.PAGE_TAPPED, { pageIndex: idx });
      // 이후는 이벤트 대기: RESTORED가 오면 아래 구독이 다음 스텝을 잡는다
    }
    // COMPLETING이면 아무것도 안 함 — 펜이 쓰는 중, RESTORED 이벤트를 기다린다
  }

  // ── 이벤트 구독 ──

  bus.on(EVENTS.REVEAL_STARTED, () => {
    pageStates.clear();
    clearTimer();
    setActive(false); // 새 뽑기는 항상 수동으로 시작 (사용자가 낭독을 켠다)
  });

  bus.on(EVENTS.PAGE_STATE_CHANGED, ({ pageIndex, state }) => {
    pageStates.set(pageIndex, state);
    if (!active) return;
    // 어느 장이든 복원이 확정되면 잠깐 숨 고르고 다음 장으로.
    // (수동 탭으로 복원된 경우도 동일하게 이어받는다)
    if (state === PAGE_STATES.RESTORED) scheduleStep(timing.betweenPagesMs);
  });

  bus.on(EVENTS.SKIP_PRESSED, () => setActive(false));
  bus.on(EVENTS.REVEAL_ALL_DONE, () => setActive(false));
  bus.on(EVENTS.AUTO_REVEAL_TOGGLED, () => setActive(!active));

  return { isActive: () => active };
}
