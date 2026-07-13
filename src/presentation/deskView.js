// deskView.js — 책상 주변 UI: 복원 버튼, 반향/언약 표시, 속독, 요약.
// 페이지 카드 내부는 pageView 소관 — 여기서는 절대 건드리지 않는다.

import { EVENTS } from "../eventBus.js";

export function createDeskView({ bus, elements, config, strings }) {
  const {
    desk, btnSingle, btnMulti, btnSkip, btnAuto,
    currencyEl, pityFill, pityLabel, libraryCountEl,
    noticeEl, summaryEl,
  } = elements;

  let revealing = false;

  // ── 초기 화면: 빈 책상 안내 + 버튼 라벨 (문구는 전부 strings에서) ──
  function showEmptyHint() {
    desk.innerHTML = `
      <div class="empty-hint">
        <span class="pen-mark">✒</span>
        잊히기 전에, 다시 읽히게 하라.<br>
        펜을 적셔 첫 페이지를 복원하세요.
      </div>
    `;
  }

  btnSingle.innerHTML = `${strings.drawSingle}<span class="cost">${strings.currency} ${config.cost.single}</span>`;
  btnMulti.innerHTML = `${strings.drawMulti}<span class="cost">${strings.currency} ${config.cost.multi}</span>`;
  btnSkip.textContent = strings.skip;
  btnAuto.textContent = strings.autoReveal;
  showEmptyHint();

  function setControls({ drawEnabled, skipVisible }) {
    btnSingle.disabled = !drawEnabled;
    btnMulti.disabled = !drawEnabled;
    btnSkip.classList.toggle("hidden", !skipVisible);
    btnAuto.classList.toggle("hidden", !skipVisible); // 낭독도 연출 중에만 노출
  }

  function showNotice(msg) {
    noticeEl.textContent = msg;
    setTimeout(() => { if (noticeEl.textContent === msg) noticeEl.textContent = ""; }, 2500);
  }

  // ── 입력 → 이벤트 발행 (직접 로직 호출 금지) ──
  btnSingle.addEventListener("click", () =>
    bus.emit(EVENTS.DRAW_REQUESTED, { count: 1 }));
  btnMulti.addEventListener("click", () =>
    bus.emit(EVENTS.DRAW_REQUESTED, { count: config.multiDraw.count }));
  btnSkip.addEventListener("click", () =>
    bus.emit(EVENTS.SKIP_PRESSED));
  btnAuto.addEventListener("click", () =>
    bus.emit(EVENTS.AUTO_REVEAL_TOGGLED));

  // 낭독 켜짐/꺼짐을 버튼 모양에 반영
  bus.on(EVENTS.AUTO_REVEAL_CHANGED, ({ active }) => {
    btnAuto.classList.toggle("active", active);
  });

  // ── 이벤트 구독 → 화면 갱신 ──

  bus.on(EVENTS.REVEAL_STARTED, ({ count }) => {
    revealing = true;
    summaryEl.classList.add("hidden");
    desk.classList.toggle("single", count === 1);
    // 페이지 카드 자체는 pageView가 그린다. 여기선 버튼 상태만.
    setControls({ drawEnabled: false, skipVisible: true });
  });

  bus.on(EVENTS.DRAW_REJECTED, ({ reason }) => {
    if (reason === "not_enough_currency") showNotice(strings.notEnoughCurrency);
  });

  bus.on(EVENTS.REVEAL_ALL_DONE, ({ results }) => {
    revealing = false;
    setControls({ drawEnabled: true, skipVisible: false });
    // 최고 등급 페이지를 요약에 표시
    const best = results.reduce((a, b) =>
      config.rarities[b.rarity].rank > config.rarities[a.rarity].rank ? b : a
    );
    summaryEl.innerHTML =
      `${strings.summaryTitle} ${results.length}장 — ` +
      `<span class="best">${config.rarities[best.rarity].label} 『${best.character.name}』</span>` +
      `${results.length > 1 ? " 외" : ""}가 결말을 얻었다.`;
    summaryEl.classList.remove("hidden");
  });

  bus.on(EVENTS.STATE_CHANGED, (s) => {
    currencyEl.textContent = `${strings.currency} ${s.currency.toLocaleString()}`;
    libraryCountEl.textContent = `서고 ${s.libraryCount}장`;
    const pct = Math.min(100, (s.pity / config.pity.threshold) * 100);
    pityFill.style.width = `${pct}%`;
    pityLabel.textContent = `${strings.pityLabel} ${s.pity}/${config.pity.threshold}`;
  });

  return { showEmptyHint, isRevealing: () => revealing };
}
