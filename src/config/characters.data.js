// characters.data.js — 캐릭터 풀. 캐릭터 추가/수정은 이 파일만 편집하면 된다.
// brokenSentence: 이야기가 끊긴 지점의 문장 (티징 단계에서 쓰이다 멈춤)
// completedSentence: 사서의 펜이 이어 쓰는 결말 (복원 순간 완성됨)
// deathCause: 이 이야기가 죽은 사연 (도감/상세 화면용)

export const CHARACTERS = [
  // ── SSR · 절창(絶唱) ──────────────────────────────
  {
    id: "wuxia_swordsman_01",
    name: "미완의 검객",
    rarity: "SSR",
    genre: "wuxia",
    brokenSentence: "검을 들어 올린 순간, 하늘이 —",
    completedSentence: "그의 이름을 불렀다.",
    deathCause: "최종 결전 직전, 연재 중단",
  },
  {
    id: "mahou_lastgirl_01",
    name: "종막의 마법소녀",
    rarity: "SSR",
    genre: "mahou_shoujo",
    brokenSentence: "마지막 변신 주문이 입술에 닿기 전, 세계가 —",
    completedSentence: "한 번 더 그녀를 불렀다.",
    deathCause: "서비스 종료 공지와 함께 변신 해제",
  },

  // ── SR · 일화(逸話) ──────────────────────────────
  {
    id: "sf_android_01",
    name: "각성 직전의 안드로이드",
    rarity: "SR",
    genre: "sf",
    brokenSentence: "화가가 붓을 놓친 밤, 그의 눈동자에 처음으로 —",
    completedSentence: "빛이 고였다.",
    deathCause: "자아를 각성하는 최종화 원고 유실",
  },
  {
    id: "mystery_detective_01",
    name: "미제 사건의 탐정",
    rarity: "SR",
    genre: "mystery",
    brokenSentence: "범인의 이름을 말하려던 찰나, 페이지가 —",
    completedSentence: "다시 넘어가기 시작했다.",
    deathCause: "범인 공개 직전 잡지 폐간",
  },
  {
    id: "fantasy_dragonknight_01",
    name: "서약을 잃은 용기사",
    rarity: "SR",
    genre: "fantasy",
    brokenSentence: "용의 숨결 앞에서, 부러진 창이 —",
    completedSentence: "다시 벼려졌다.",
    deathCause: "3부작 중 2부에서 출판 중단",
  },

  // ── R · 단편(斷片) ──────────────────────────────
  {
    id: "romance_heroine_01",
    name: "3화의 히로인",
    rarity: "R",
    genre: "romance",
    brokenSentence: "우산 아래에서, 미처 전하지 못한 말이 —",
    completedSentence: "빗소리보다 먼저 닿았다.",
    deathCause: "3화 만에 연재 중단",
  },
  {
    id: "sf_pilotbot_01",
    name: "파일럿판의 조수 로봇",
    rarity: "R",
    genre: "sf",
    brokenSentence: "첫 임무 보고를 마치기 전에, 전원이 —",
    completedSentence: "다시 켜졌다.",
    deathCause: "파일럿 에피소드만 남기고 편성 취소",
  },
  {
    id: "mystery_passerby_01",
    name: "배경의 목격자",
    rarity: "R",
    genre: "mystery",
    brokenSentence: "그가 본 것을 말하려는 순간, 장면이 —",
    completedSentence: "그를 비추었다.",
    deathCause: "단역으로 스쳐 지나간 뒤 등장 없음",
  },
  {
    id: "fantasy_gatekeeper_01",
    name: "이름 없는 문지기",
    rarity: "R",
    genre: "fantasy",
    brokenSentence: "천 년을 지킨 문이 열리던 날, 그의 이름은 —",
    completedSentence: "비로소 불리었다.",
    deathCause: "설정집에만 존재, 본편 미등장",
  },
];
