// rng.js — 시드 주입 가능한 난수 생성기 (mulberry32)
// Math.random을 직접 쓰지 않는 이유: 시드를 고정하면 뽑기 결과가 재현 가능해져
// 확률 검증과 버그 재현이 가능하기 때문.

export function createRng(seed = Date.now()) {
  let s = seed >>> 0;
  return function next() {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296; // [0, 1)
  };
}
