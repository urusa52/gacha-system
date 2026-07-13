// reveal.config.js — 공개 연출의 박자(타이밍) 전용 설정.
// 연출 속도 튜닝은 코드가 아니라 이 파일에서 한다.

export const REVEAL_TIMING = {
  penMsPerChar: 75,     // 사서의 펜이 한 글자를 쓰는 시간
  inkSettleMs: 500,     // 문장 완성 후 잉크가 마르는 여운
  brokenPauseMs: 1100,  // [낭독] 끊긴 문장을 음미하는 시간
  betweenPagesMs: 400,  // [낭독] 한 장이 복원된 뒤 다음 장으로 넘어가는 간격
};
