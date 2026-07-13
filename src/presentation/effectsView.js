// effectsView.js — 페이지 카드 "바깥"의 화면급 연출.
// 절창(SSR)이 복원되는 순간, 서고 전체의 등불이 켜진다.
// 카드 내부 연출은 pageView, 책상 주변 UI는 deskView — 여긴 화면 전체만.

import { EVENTS } from "../eventBus.js";
import { PAGE_STATES } from "./revealStateMachine.js";

export function createEffectsView({ bus, glowEl, guaranteeRarity }) {
  function flare() {
    // 연속 발동(속독으로 SSR 여러 장 동시 복원 등)에도 매번 다시 재생되도록
    // 클래스를 뗐다 붙이며 리플로우로 애니메이션을 리셋한다.
    glowEl.classList.remove("flare");
    void glowEl.offsetWidth;
    glowEl.classList.add("flare");
  }

  bus.on(EVENTS.PAGE_STATE_CHANGED, ({ state, result }) => {
    if (state === PAGE_STATES.RESTORED && result.rarity === guaranteeRarity) {
      flare();
    }
  });
}
