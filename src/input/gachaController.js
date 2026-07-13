// gachaController.js — 입력을 받아 "검증 → 엔진 → 상태 → 이벤트" 순서를 조율하는 유일한 곳.
// 엔진(순수 로직)과 상태(저장소)를 여기서만 연결하고,
// 결과는 DRAW_RESOLVED 이벤트로 흘려보내 연출/화면이 알아서 받게 한다.

import { EVENTS } from "../eventBus.js";
import { drawBatch } from "../core/gachaEngine.js";

export function createGachaController({ bus, gameState, config, characters, rng }) {
  function performDraw(count) {
    const cost = count === 1 ? config.cost.single : config.cost.multi;

    if (!gameState.canAfford(cost)) {
      bus.emit(EVENTS.DRAW_REJECTED, { reason: "not_enough_currency", cost });
      return null;
    }

    // 엔진은 순수 함수 — 현재 언약 카운터를 읽어서 넘겨준다.
    const { pity } = gameState.snapshot();
    const { results, pityAfter } = drawBatch(config, characters, pity, count, rng);

    // 결과 확정은 연출과 무관하게 즉시 일어난다.
    // (화면은 이걸 받아 "한 장씩 공개"만 담당 — 새로고침해도 결과는 이미 확정)
    gameState.applyDrawOutcome({ cost, results, pityAfter });
    bus.emit(EVENTS.DRAW_RESOLVED, { results, cost });
    return results;
  }

  // 화면 버튼이 쏘는 요청 이벤트 구독
  bus.on(EVENTS.DRAW_REQUESTED, ({ count }) => performDraw(count));

  return { performDraw };
}
