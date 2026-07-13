// strings.ko.js — UI 문구 전용. 세계관 용어를 한곳에서 관리한다.

export const STRINGS = {
  drawSingle: "한 장(張) 복원",
  drawMulti: "합본 복원",
  skip: "속독(速讀)",
  currency: "반향",
  pityLabel: "사서의 언약",
  pityDescription: (n, threshold) => `언약까지 ${threshold - n}페이지`,
  notEnoughCurrency: "반향이 부족합니다. 서고가 너무 조용해요.",
  summaryTitle: "복원된 페이지",
};
