// gacha.config.js — 밸런스 수치 전용. 코드 수정 없이 이 파일만 바꿔 밸런싱한다.

export const GACHA_CONFIG = {
  // rank: 등급 비교용 숫자 (높을수록 귀함). 엔진이 보장 규칙 판정에 사용.
  // inkVitality: 잉크 얼룩 티징 연출 프리셋 키 (page.css / pageView가 해석)
  rarities: {
    SSR: { rate: 0.03, rank: 3, label: "절창(絶唱)", inkVitality: "living" },
    SR:  { rate: 0.12, rank: 2, label: "일화(逸話)", inkVitality: "breathing" },
    R:   { rate: 0.85, rank: 1, label: "단편(斷片)", inkVitality: "faded" },
  },

  // 사서의 언약: threshold번째 복원 안에 guarantee 등급을 반드시 복원한다.
  // 카운터는 SSR 복원 시점에 0으로 되돌아간다.
  pity: { threshold: 90, guarantee: "SSR" },

  // 합본 복원(10연차) 보장: count장 중 minGuaranteeRank 이상이 없으면
  // 마지막 결과 하나를 해당 등급으로 승격한다.
  multiDraw: { count: 10, minGuarantee: "SR" },

  // 반향(재화) 비용
  cost: { single: 160, multi: 1600 },

  // 시작 시 지급되는 반향 (데모/심사용 여유치)
  startingCurrency: 24000,

  // localStorage 저장 키 — 세이브 구조가 바뀌면 버전을 올려 옛 세이브와 충돌을 막는다
  saveKey: "unfinished-library-save-v1",
};
