// gachaEngine.js — 뽑기(복원) 로직. 전부 순수 함수.
// 상태를 직접 읽거나 쓰지 않고, 입력(config/pity/rng)을 받아 "결과"만 돌려준다.
// 덕분에 UI 없이 단독으로 테스트·확률검증이 가능하다.

/** 등급 하나를 판정한다. 언약(pity) 도달 시 보장 등급을 강제한다. */
export function rollRarity(config, pityCount, rng) {
  // 이번이 threshold번째 복원이면 무조건 보장 등급 (사서의 언약)
  if (pityCount + 1 >= config.pity.threshold) {
    return config.pity.guarantee;
  }
  const roll = rng();
  let acc = 0;
  const entries = Object.entries(config.rarities);
  for (const [rarity, def] of entries) {
    acc += def.rate;
    if (roll < acc) return rarity;
  }
  // 부동소수점 오차로 acc가 1에 미세하게 못 미칠 때의 보정: 마지막 등급 반환
  return entries[entries.length - 1][0];
}

/** 해당 등급 풀에서 캐릭터 하나를 균등 추출한다. */
export function pickCharacter(characters, rarity, rng) {
  const pool = characters.filter((c) => c.rarity === rarity);
  if (pool.length === 0) {
    throw new Error(`[gachaEngine] 등급 "${rarity}" 풀에 캐릭터가 없습니다.`);
  }
  return pool[Math.floor(rng() * pool.length)];
}

/**
 * count장을 연속 복원한다. 언약 카운터는 장마다 순차 적용된다.
 * 10연(합본) 보장: minGuarantee 이상이 하나도 없으면 마지막 장을 승격한다.
 * @returns {{ results: Array<{rarity, character, pityWhenDrawn, promoted?}>, pityAfter: number }}
 */
export function drawBatch(config, characters, startPity, count, rng) {
  const results = [];
  let pity = startPity;

  for (let i = 0; i < count; i++) {
    const rarity = rollRarity(config, pity, rng);
    const pityWhenDrawn = pity;
    // 보장 등급(SSR) 복원 시 언약 카운터가 0으로 돌아간다.
    pity = rarity === config.pity.guarantee ? 0 : pity + 1;
    results.push({
      rarity,
      character: pickCharacter(characters, rarity, rng),
      pityWhenDrawn,
    });
  }

  // 합본 복원 보장 검사 (count가 합본 규격일 때만)
  if (count === config.multiDraw.count) {
    const minRank = config.rarities[config.multiDraw.minGuarantee].rank;
    const hasGuarantee = results.some(
      (r) => config.rarities[r.rarity].rank >= minRank
    );
    if (!hasGuarantee) {
      // 마지막 장을 보장 등급으로 승격한다. (언약 카운터에는 영향 없음 —
      // 승격 등급은 pity 보장 등급이 아니기 때문)
      const promotedRarity = config.multiDraw.minGuarantee;
      results[results.length - 1] = {
        rarity: promotedRarity,
        character: pickCharacter(characters, promotedRarity, rng),
        pityWhenDrawn: results[results.length - 1].pityWhenDrawn,
        promoted: true,
      };
    }
  }

  return { results, pityAfter: pity };
}
