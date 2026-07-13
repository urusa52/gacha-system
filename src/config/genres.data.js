// genres.data.js — 장르별 연출 모티프. 종이 질감·서체·잉크색은 전부 데이터.
// paperTexture / fontFamily 값은 3단계에서 page.css 클래스명과 매핑된다.

export const GENRES = {
  wuxia: {
    label: "무협",
    paperTexture: "hanji",      // 세로결 한지
    fontFamily: "brush",        // 붓글씨 계열
    inkColor: "#3B2F23",
  },
  sf: {
    label: "SF",
    paperTexture: "print-glitch", // 글리치 낀 인쇄지
    fontFamily: "mono",
    inkColor: "#1E3A4C",
  },
  mahou_shoujo: {
    label: "마법소녀",
    paperTexture: "screentone",  // 만화 스크린톤
    fontFamily: "round",
    inkColor: "#5C2E52",
  },
  mystery: {
    label: "미스터리",
    paperTexture: "aged-report", // 누렇게 바랜 조서
    fontFamily: "serif",
    inkColor: "#26282E",
  },
  romance: {
    label: "로맨스",
    paperTexture: "letter",      // 편지지
    fontFamily: "script",
    inkColor: "#6E3B44",
  },
  fantasy: {
    label: "판타지",
    paperTexture: "parchment",   // 양피지
    fontFamily: "antiqua",
    inkColor: "#3C3524",
  },
};
