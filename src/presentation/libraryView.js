// libraryView.js — 서고 열람(도감). 복원한 이야기들의 목록.
// 소유 여부는 gameState 스냅샷(STATE_CHANGED)에서만 읽는다 — 자체 상태를 갖지 않는다.

import { EVENTS } from "../eventBus.js";

export function createLibraryView({ bus, elements, characters, genres, rarities, strings }) {
  const { openBtn, overlay, titleEl, gridEl, closeBtn } = elements;

  let latestSnapshot = { library: [] };
  bus.on(EVENTS.STATE_CHANGED, (s) => {
    latestSnapshot = s;
    // 열려 있는 동안 상태가 바뀌면(연출 뒤 자동 저장 등) 즉시 갱신
    if (!overlay.classList.contains("hidden")) render();
  });

  /** characterId → 복원 횟수 집계 */
  function countByCharacter() {
    const counts = new Map();
    for (const entry of latestSnapshot.library) {
      counts.set(entry.characterId, (counts.get(entry.characterId) || 0) + 1);
    }
    return counts;
  }

  function render() {
    const counts = countByCharacter();
    const ownedKinds = characters.filter((c) => counts.has(c.id)).length;
    titleEl.textContent = strings.libraryTitle(ownedKinds, characters.length);

    // 등급 높은 순 → 같은 등급 내 데이터 순으로 정렬해 절창이 맨 앞에 오게
    const sorted = [...characters].sort(
      (a, b) => rarities[b.rarity].rank - rarities[a.rarity].rank
    );

    gridEl.innerHTML = sorted.map((c) => {
      const count = counts.get(c.id) || 0;
      const genre = genres[c.genre];
      if (count === 0) {
        // 미보유: 정체를 숨긴 잠든 페이지 — 장르와 등급만 힌트로
        return `
          <div class="codex-card locked rarity-${c.rarity.toLowerCase()}">
            <div class="codex-name">???</div>
            <div class="codex-sub">${rarities[c.rarity].label} · ${genre.label}</div>
            <div class="codex-desc">${strings.libraryLocked}</div>
          </div>
        `;
      }
      const fullSentence =
        c.brokenSentence.replace(/\s*—\s*$/, " ") + c.completedSentence;
      return `
        <div class="codex-card rarity-${c.rarity.toLowerCase()}">
          <div class="codex-name">${c.name}${count > 1 ? ` <span class="codex-count">×${count}</span>` : ""}</div>
          <div class="codex-sub">${rarities[c.rarity].label} · ${genre.label}</div>
          <div class="codex-sentence">"${fullSentence}"</div>
          <div class="codex-desc">${c.deathCause}</div>
        </div>
      `;
    }).join("");
  }

  function open() {
    render();
    overlay.classList.remove("hidden");
  }
  function close() {
    overlay.classList.add("hidden");
  }

  openBtn.textContent = strings.libraryOpen;
  closeBtn.textContent = strings.libraryClose;
  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  // 패널 바깥(어두운 배경) 클릭으로도 닫기
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });

  return { open, close };
}
