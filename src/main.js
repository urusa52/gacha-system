// main.js — 조립 전용. 모듈 생성과 연결만 하고, 로직은 갖지 않는다.

import { createEventBus, EVENTS } from "./eventBus.js";
import { GACHA_CONFIG } from "./config/gacha.config.js";
import { CHARACTERS } from "./config/characters.data.js";
import { STRINGS } from "./config/strings.ko.js";
import { createRng } from "./core/rng.js";
import { createGameState } from "./state/gameState.js";
import { createGachaController } from "./input/gachaController.js";
import { createRevealStateMachine, PAGE_STATES } from "./presentation/revealStateMachine.js";
import { verifyRates } from "./dev/verifyRates.js";

const bus = createEventBus();
const rng = createRng(); // 실플레이는 시간 시드, 테스트는 고정 시드 주입
const gameState = createGameState(bus, GACHA_CONFIG);
const controller = createGachaController({
  bus, gameState, config: GACHA_CONFIG, characters: CHARACTERS, rng,
});
const revealMachine = createRevealStateMachine(bus);

// ── 2단계 확인용: 연출 상태를 콘솔로 관찰 (3단계에서 View로 대체) ──

const STATE_LABELS = {
  [PAGE_STATES.FADED]: "…바랜 백지 (잉크 얼룩이 남아 있다)",
  [PAGE_STATES.BROKEN]: "끊긴 문장이 드러난다",
  [PAGE_STATES.COMPLETING]: "사서의 펜이 이어 쓰는 중…",
  [PAGE_STATES.RESTORED]: "복원 완료!",
};

bus.on(EVENTS.PAGE_STATE_CHANGED, ({ pageIndex, state, result }) => {
  const c = result.character;
  if (state === PAGE_STATES.BROKEN) {
    console.log(`[${pageIndex}] ${STATE_LABELS[state]} — "${c.brokenSentence}"`);
  } else if (state === PAGE_STATES.RESTORED) {
    console.log(
      `[${pageIndex}] ${STATE_LABELS[state]} [${result.rarity}] ${c.name}\n` +
      `      "${c.brokenSentence.replace(/ —$/, "")} ${c.completedSentence}"`
    );
  } else {
    console.log(`[${pageIndex}] ${STATE_LABELS[state]}`);
  }

  // 아직 pageView가 없으므로 펜 애니메이션을 타이머로 흉내 낸다.
  // 3단계에서 pageView가 transitionend로 PAGE_ANIM_DONE을 쏘면 이 블록은 제거.
  if (state === PAGE_STATES.COMPLETING) {
    setTimeout(() => bus.emit(EVENTS.PAGE_ANIM_DONE, { pageIndex }), 600);
  }
});

bus.on(EVENTS.REVEAL_ALL_DONE, ({ results }) => {
  const best = results.reduce((a, b) =>
    GACHA_CONFIG.rarities[b.rarity].rank > GACHA_CONFIG.rarities[a.rarity].rank ? b : a
  );
  console.log(`%c― ${STRINGS.summaryTitle}: ${results.length}장 (최고: ${best.rarity} ${best.character.name}) ―`, "color:#B8965A;font-weight:bold");
});

bus.on(EVENTS.DRAW_REJECTED, () => console.warn(STRINGS.notEnoughCurrency));
bus.on(EVENTS.STATE_CHANGED, (s) => {
  console.log(`  반향 ${s.currency} · 언약 ${s.pity}/${GACHA_CONFIG.pity.threshold} · 서고 ${s.libraryCount}장`);
});

// 브라우저 콘솔에서 직접 조작할 수 있는 디버그 API
window.debug = {
  drawSingle: () => bus.emit(EVENTS.DRAW_REQUESTED, { count: 1 }),
  drawMulti: () => bus.emit(EVENTS.DRAW_REQUESTED, { count: GACHA_CONFIG.multiDraw.count }),
  tap: (i) => bus.emit(EVENTS.PAGE_TAPPED, { pageIndex: i }),   // 페이지 탭
  skip: () => bus.emit(EVENTS.SKIP_PRESSED),                     // 속독
  pages: () => revealMachine.snapshot(),                          // 연출 상태 보기
  state: () => gameState.snapshot(),
  verifyRates: (n = 100000) => verifyRates(GACHA_CONFIG, CHARACTERS, n),
};

console.log("%c미완(未完)의 서고 — 2단계: 공개 연출 상태 머신 가동", "font-weight:bold");
console.log("debug.drawMulti() 후 → debug.tap(0) 두 번 → 복원 / debug.skip() = 속독");
