// eventBus.js — 모듈 간 통신의 유일한 통로 (pub/sub)
// 모듈들이 서로를 직접 참조하지 않도록, 이벤트 이름 문자열로만 연결한다.

export function createEventBus() {
  const listeners = new Map(); // eventName -> Set<handler>

  return {
    on(eventName, handler) {
      if (!listeners.has(eventName)) listeners.set(eventName, new Set());
      listeners.get(eventName).add(handler);
      // 구독 해제 함수를 돌려줘서, 구독자가 스스로 정리할 수 있게 한다.
      return () => listeners.get(eventName)?.delete(handler);
    },

    emit(eventName, payload) {
      const set = listeners.get(eventName);
      if (!set) return;
      // 핸들러 하나의 에러가 다른 구독자를 막지 않도록 격리한다.
      for (const handler of [...set]) {
        try {
          handler(payload);
        } catch (err) {
          console.error(`[eventBus] "${eventName}" 핸들러 에러:`, err);
        }
      }
    },
  };
}

// 이벤트 이름을 상수로 모아, 오타로 인한 조용한 버그를 막는다.
export const EVENTS = {
  DRAW_REQUESTED: "draw:requested",   // 입력 → (복원 요청: { count })
  DRAW_REJECTED: "draw:rejected",     // 상태 → (반향 부족 등: { reason })
  DRAW_RESOLVED: "draw:resolved",     // 입력 → 연출/상태 ({ results, cost })
  STATE_CHANGED: "state:changed",     // 상태 → 화면 (스냅샷)
  PAGE_TAPPED: "page:tapped",         // 화면 → 연출 ({ pageIndex })
  SKIP_PRESSED: "skip:pressed",       // 화면 → 연출 (속독)
  PAGE_STATE_CHANGED: "page:stateChanged", // 연출 → 화면
  REVEAL_ALL_DONE: "reveal:allDone",  // 연출 → 화면/상태
};
