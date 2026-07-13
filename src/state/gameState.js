// gameState.js — 게임 상태의 단일 저장소.
// 상태 변경은 반드시 여기서 정의한 메서드로만 일어난다.
// 변경이 일어나면 STATE_CHANGED 이벤트로 스냅샷을 발행한다.
// (localStorage 영속화는 4단계에서 이 파일에만 추가하면 된다.)

import { EVENTS } from "../eventBus.js";

export function createGameState(bus, config) {
  // 내부 상태 — 모듈 밖으로 직접 노출하지 않는다.
  const state = {
    currency: config.startingCurrency, // 반향
    pity: 0,                           // 사서의 언약 카운터
    library: [],                       // 복원된 페이지들 (인벤토리)
    totalDraws: 0,
  };

  function emitSnapshot() {
    bus.emit(EVENTS.STATE_CHANGED, snapshot());
  }

  /** 외부에는 항상 복사본만 준다. 원본 변형을 막기 위함. */
  function snapshot() {
    return {
      currency: state.currency,
      pity: state.pity,
      libraryCount: state.library.length,
      library: [...state.library],
      totalDraws: state.totalDraws,
    };
  }

  return {
    snapshot,

    /** 복원 비용을 지불할 수 있는지 검사만 한다 (변경 없음). */
    canAfford(cost) {
      return state.currency >= cost;
    },

    /**
     * 복원 결과를 상태에 반영하는 유일한 경로.
     * 비용 차감 + 페이지 수집 + 언약 카운터 갱신을 한 번에(원자적으로) 처리해
     * 어중간한 중간 상태가 생기지 않게 한다.
     */
    applyDrawOutcome({ cost, results, pityAfter }) {
      if (state.currency < cost) {
        throw new Error("[gameState] 반향 부족 상태에서 결과 반영 시도");
      }
      state.currency -= cost;
      state.pity = pityAfter;
      state.totalDraws += results.length;
      for (const r of results) {
        state.library.push({
          characterId: r.character.id,
          rarity: r.rarity,
          restoredAt: state.totalDraws, // 몇 번째 복원이었는지 기록
        });
      }
      emitSnapshot();
    },

    /** 반향 획득 (서사 완성 보상 등에서 사용 예정) */
    gainCurrency(amount) {
      state.currency += amount;
      emitSnapshot();
    },
  };
}
