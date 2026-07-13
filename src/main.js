// main.js — 조립 전용. 모듈 생성과 연결만 하고, 로직은 갖지 않는다.

import { createEventBus, EVENTS } from "./eventBus.js";
import { GACHA_CONFIG } from "./config/gacha.config.js";
import { CHARACTERS } from "./config/characters.data.js";
import { STRINGS } from "./config/strings.ko.js";
import { createRng } from "./core/rng.js";
import { createGameState } from "./state/gameState.js";
import { createGachaController } from "./input/gachaController.js";
import { verifyRates } from "./dev/verifyRates.js";

const bus = createEventBus();
const rng = createRng(); // 실플레이는 시간 시드, 테스트는 고정 시드 주입
const gameState = createGameState(bus, GACHA_CONFIG);
const controller = createGachaController({
  bus, gameState, config: GACHA_CONFIG, characters: CHARACTERS, rng,
});

// ── 1단계 확인용 콘솔 로그 (3단계에서 View로 대체) ──
bus.on(EVENTS.DRAW_RESOLVED, ({ results, cost }) => {
  console.log(`%c― ${results.length}장 복원 (반향 -${cost}) ―`, "color:#B8965A");
  for (const r of results) {
    const mark = r.promoted ? " [합본 보장 승격]" : "";
    console.log(
      `  [${r.rarity}] ${r.character.name}${mark}\n` +
      `      "${r.character.brokenSentence}" → "${r.character.completedSentence}"`
    );
  }
});
bus.on(EVENTS.DRAW_REJECTED, () => console.warn(STRINGS.notEnoughCurrency));
bus.on(EVENTS.STATE_CHANGED, (s) => {
  console.log(`  반향 ${s.currency} · 언약 ${s.pity}/${GACHA_CONFIG.pity.threshold} · 서고 ${s.libraryCount}장`);
});

// 브라우저 콘솔에서 직접 조작할 수 있는 디버그 API
window.debug = {
  drawSingle: () => bus.emit(EVENTS.DRAW_REQUESTED, { count: 1 }),
  drawMulti: () => bus.emit(EVENTS.DRAW_REQUESTED, { count: GACHA_CONFIG.multiDraw.count }),
  state: () => gameState.snapshot(),
  verifyRates: (n = 100000) => verifyRates(GACHA_CONFIG, CHARACTERS, n),
};

console.log("%c미완(未完)의 서고 — 1단계 뼈대 가동", "font-weight:bold");
console.log("debug.drawSingle() / debug.drawMulti() / debug.state() / debug.verifyRates()");
