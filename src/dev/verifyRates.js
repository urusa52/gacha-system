// verifyRates.js — 확률 검증 도구 (개발/제출 문서용).
// 엔진을 대량 시뮬레이션해서 설정 확률과 실측 확률을 비교한다.
// 브라우저 콘솔에서 window.debug.verifyRates(100000) 로 실행.

import { drawBatch } from "../core/gachaEngine.js";
import { createRng } from "../core/rng.js";

export function verifyRates(config, characters, totalDraws = 100000, seed = 12345) {
  const rng = createRng(seed);
  const counts = Object.fromEntries(Object.keys(config.rarities).map((r) => [r, 0]));

  let pity = 0;
  let pityTriggers = 0;       // 언약이 실제로 발동한 횟수
  let ssrGaps = [];           // SSR 사이 간격 (평균 확인용)
  let sinceLastSSR = 0;

  // 10연 단위로 시뮬레이션 (합본 보장 포함 실측)
  const batches = Math.floor(totalDraws / config.multiDraw.count);
  for (let i = 0; i < batches; i++) {
    const { results, pityAfter } = drawBatch(
      config, characters, pity, config.multiDraw.count, rng
    );
    for (const r of results) {
      counts[r.rarity]++;
      sinceLastSSR++;
      if (r.pityWhenDrawn + 1 >= config.pity.threshold) pityTriggers++;
      if (r.rarity === "SSR") {
        ssrGaps.push(sinceLastSSR);
        sinceLastSSR = 0;
      }
    }
    pity = pityAfter;
  }

  const drawn = batches * config.multiDraw.count;
  const report = Object.entries(counts).map(([rarity, n]) => ({
    등급: `${rarity} ${config.rarities[rarity].label}`,
    설정확률: `${(config.rarities[rarity].rate * 100).toFixed(2)}%`,
    실측확률: `${((n / drawn) * 100).toFixed(2)}%`,
    횟수: n,
  }));

  const avgGap = ssrGaps.length
    ? (ssrGaps.reduce((a, b) => a + b, 0) / ssrGaps.length).toFixed(1)
    : "N/A";

  console.table(report);
  console.log(`총 ${drawn.toLocaleString()}회 복원 (시드 ${seed})`);
  console.log(`사서의 언약 발동: ${pityTriggers}회 / SSR 평균 간격: ${avgGap}장 (언약 상한 ${config.pity.threshold})`);
  return { report, pityTriggers, avgGap };
}
