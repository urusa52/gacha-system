// pageView.js — 페이지 카드 하나하나의 렌더링과 공개 애니메이션.
// PAGE_STATE_CHANGED를 구독해 상태에 맞는 모습만 그린다.
// 로직(다음 상태가 무엇인가)은 전혀 모른다 — 탭이 오면 PAGE_TAPPED만 쏜다.

import { EVENTS } from "../eventBus.js";

// 펜이 글자를 쓰는 속도(ms/자). 연출 튜닝은 이 상수만 조절.
const PEN_MS_PER_CHAR = 75;
const INK_SETTLE_MS = 500; // 문장 완성 후 잉크가 마르는 여운

export function createPageView({ bus, container, genres, rarities }) {
  // pageIndex → { el, typingTimer } — 진행 중 애니메이션을 취소할 수 있어야
  // 속독(즉시 RESTORED 전환) 시 잔여 타이머가 화면을 덮어쓰지 않는다.
  const pageEls = new Map();

  function getOrCreatePageEl(pageIndex) {
    if (pageEls.has(pageIndex)) return pageEls.get(pageIndex);
    const el = document.createElement("div");
    el.className = "page";
    el.style.setProperty("--i", pageIndex); // 순차 등장 딜레이용
    el.addEventListener("click", () => {
      bus.emit(EVENTS.PAGE_TAPPED, { pageIndex });
    });
    container.appendChild(el);
    const entry = { el, typingTimer: null };
    pageEls.set(pageIndex, entry);
    return entry;
  }

  function clearTyping(entry) {
    if (entry.typingTimer) {
      clearInterval(entry.typingTimer);
      entry.typingTimer = null;
    }
  }

  /** 상태 클래스와 장르 스타일을 페이지 요소에 입힌다. */
  function applyBaseClasses(el, state, result) {
    const genre = genres[result.character.genre];
    el.className = "page"; // 상태 클래스 리셋
    el.classList.add(`st-${state.toLowerCase()}`);
    el.classList.add(`rarity-${result.rarity.toLowerCase()}`);
    // FADED에서는 아직 장르(종이 질감)를 숨긴다 — 티징은 얼룩뿐
    if (state !== "FADED") {
      el.classList.add(`texture-${genre.paperTexture}`);
      el.style.setProperty("--page-ink", genre.inkColor);
    }
    if (result.character.revealPreset) {
      el.classList.add(`preset-${result.character.revealPreset}`);
    }
    el.style.setProperty("--i", 0); // 등장 딜레이는 첫 렌더에서만
  }

  // ── 상태별 렌더 함수 ──

  function renderFaded(el, result) {
    const vitality = rarities[result.rarity].inkVitality;
    el.classList.add(`vitality-${vitality}`);
    el.innerHTML = `
      <div class="ghost-lines"></div>
      <div class="stain"></div>
    `;
  }

  function renderBroken(el, result) {
    const genre = genres[result.character.genre];
    // 끊긴 지점의 '—'를 분리해 깜빡임을 준다
    const sentence = result.character.brokenSentence.replace(
      /—\s*$/,
      `<span class="cut-mark">—</span>`
    );
    el.innerHTML = `
      <div class="sentence-area">
        <div class="genre-label">${genre.label}</div>
        <div class="broken-sentence">${sentence}</div>
        <div class="completed-line"></div>
      </div>
    `;
  }

  function renderCompleting(entry, pageIndex, result) {
    const { el } = entry;
    // BROKEN 화면 위에 이어 쓰므로 구조를 다시 그리지 않고 글줄만 채운다
    if (!el.querySelector(".completed-line")) renderBroken(el, result);
    const line = el.querySelector(".completed-line");
    const text = result.character.completedSentence;

    let pos = 0;
    clearTyping(entry);
    entry.typingTimer = setInterval(() => {
      pos++;
      line.textContent = text.slice(0, pos);
      if (pos >= text.length) {
        clearTyping(entry);
        // 잉크가 마르는 여운 뒤 "애니메이션 끝" 신호 → 머신이 RESTORED로 전이
        setTimeout(() => bus.emit(EVENTS.PAGE_ANIM_DONE, { pageIndex }), INK_SETTLE_MS);
      }
    }, PEN_MS_PER_CHAR);
  }

  function renderRestored(el, result) {
    const c = result.character;
    const genre = genres[c.genre];
    const rarityDef = rarities[result.rarity];
    const fullSentence =
      c.brokenSentence.replace(/\s*—\s*$/, " ") + c.completedSentence;

    // image가 있으면 일러스트, 없으면 CSS 실루엣 (에셋 없이도 완성된 화면)
    const portrait = c.image
      ? `<img src="${c.image}" alt="${c.name}" loading="lazy">`
      : `<div class="silhouette"></div>`;

    el.innerHTML = `
      ${result.promoted ? `<div class="promoted-badge">언약의 보장</div>` : ""}
      <div class="restored-layout">
        <div class="portrait">${portrait}</div>
        <div class="restored-info">
          <div class="char-name">${c.name}</div>
          <div class="full-sentence">"${fullSentence}"</div>
          <div class="rarity-chip">${rarityDef.label} · ${genre.label}</div>
        </div>
      </div>
    `;
  }

  // ── 이벤트 구독 ──

  bus.on(EVENTS.PAGE_STATE_CHANGED, ({ pageIndex, state, result }) => {
    const entry = getOrCreatePageEl(pageIndex);
    const { el } = entry;

    // 어떤 상태로 바뀌든 진행 중이던 펜 타이머는 무효 (속독 대응)
    if (state !== "COMPLETING") clearTyping(entry);

    applyBaseClasses(el, state, result);

    if (state === "FADED") renderFaded(el, result);
    else if (state === "BROKEN") renderBroken(el, result);
    else if (state === "COMPLETING") renderCompleting(entry, pageIndex, result);
    else if (state === "RESTORED") renderRestored(el, result);
  });

  // 새 공개가 시작되면 책상을 비운다 (머신이 초기 상태를 깔기 직전에 보장 발행)
  bus.on(EVENTS.REVEAL_STARTED, () => {
    for (const [, entry] of pageEls) clearTyping(entry);
    pageEls.clear();
    container.innerHTML = "";
  });

  return {
    /** 책상을 초기(빈) 상태로 되돌린다 — deskView가 사용 */
    clear() {
      for (const [, entry] of pageEls) clearTyping(entry);
      pageEls.clear();
      container.innerHTML = "";
    },
  };
}
