// main.js — 조립 전용. 모듈 생성과 연결만 하고, 로직은 갖지 않는다.

import { createEventBus, EVENTS } from "./eventBus.js";
import { GACHA_CONFIG } from "./config/gacha.config.js";
import { CHARACTERS } from "./config/characters.data.js";
import { GENRES } from "./config/genres.data.js";
import { STRINGS } from "./config/strings.ko.js";
import { REVEAL_TIMING } from "./config/reveal.config.js";
import { createRng } from "./core/rng.js";
import { createGameState } from "./state/gameState.js";
import { createGachaController } from "./input/gachaController.js";
import { createRevealStateMachine } from "./presentation/revealStateMachine.js";
import { createPageView } from "./presentation/pageView.js";
import { createDeskView } from "./presentation/deskView.js";
import { createAutoRevealDriver } from "./presentation/autoRevealDriver.js";
import { createEffectsView } from "./presentation/effectsView.js";
import { createLibraryView } from "./presentation/libraryView.js";
import { verifyRates } from "./dev/verifyRates.js";

const bus = createEventBus();
const rng = createRng(); // 실플레이는 시간 시드, 테스트는 고정 시드 주입
const gameState = createGameState(bus, GACHA_CONFIG);

createGachaController({
  bus, gameState, config: GACHA_CONFIG, characters: CHARACTERS, rng,
});
createRevealStateMachine(bus);
createAutoRevealDriver({ bus, timing: REVEAL_TIMING });

createPageView({
  bus,
  container: document.getElementById("desk"),
  genres: GENRES,
  rarities: GACHA_CONFIG.rarities,
  timing: REVEAL_TIMING,
});

createDeskView({
  bus,
  config: GACHA_CONFIG,
  strings: STRINGS,
  elements: {
    desk: document.getElementById("desk"),
    btnSingle: document.getElementById("btn-single"),
    btnMulti: document.getElementById("btn-multi"),
    btnSkip: document.getElementById("btn-skip"),
    btnAuto: document.getElementById("btn-auto"),
    currencyEl: document.getElementById("currency"),
    pityFill: document.getElementById("pity-fill"),
    pityLabel: document.getElementById("pity-label"),
    libraryCountEl: document.getElementById("library-count"),
    noticeEl: document.getElementById("notice"),
    summaryEl: document.getElementById("summary"),
  },
});

createEffectsView({
  bus,
  glowEl: document.getElementById("screen-glow"),
  guaranteeRarity: GACHA_CONFIG.pity.guarantee, // SSR
});

createLibraryView({
  bus,
  characters: CHARACTERS,
  genres: GENRES,
  rarities: GACHA_CONFIG.rarities,
  strings: STRINGS,
  elements: {
    openBtn: document.getElementById("btn-library"),
    overlay: document.getElementById("library-overlay"),
    titleEl: document.getElementById("library-title"),
    gridEl: document.getElementById("library-grid"),
    closeBtn: document.getElementById("btn-library-close"),
  },
});

// 초기 상태를 화면에 반영 (STATE_CHANGED 최초 1회 수동 발행)
bus.emit(EVENTS.STATE_CHANGED, gameState.snapshot());

// 개발/심사용 디버그 API (UI와 무관 — 콘솔 전용)
window.debug = {
  state: () => gameState.snapshot(),
  verifyRates: (n = 100000) => verifyRates(GACHA_CONFIG, CHARACTERS, n),
  resetSave: () => gameState.resetAll(), // 세이브 초기화 (심사/시연용)
};
