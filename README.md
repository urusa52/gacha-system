# 미완(未完)의 서고 — 가챠 시스템 (1단계: 뼈대)

이야기의 결말을 갖지 못한 영웅들을 "복원"하는 가챠 게임.
순수 클라이언트 사이드(HTML/CSS/JS) — GitHub Pages 배포용.

## 실행 방법
ES 모듈을 쓰므로 파일 더블클릭(file://)이 아니라 로컬 서버로 열어야 합니다.

```bash
cd gacha
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 접속 → F12 콘솔
```

## 콘솔 명령 (1단계 확인용)
- `debug.drawSingle()` — 한 장 복원
- `debug.drawMulti()` — 합본 복원(10장, SR 이상 1장 보장)
- `debug.state()` — 반향 / 사서의 언약 카운터 / 서고 현황
- `debug.verifyRates(100000)` — 설정 확률 vs 실측 확률 검증

## 구조
```
src/
  config/   확률·캐릭터·장르·문구 (전부 데이터, 코드 아님)
  core/     rng + gachaEngine (순수 함수 — 언약/합본 보장 포함)
  state/    gameState (상태 변경의 유일한 경로)
  input/    gachaController (검증→엔진→상태→이벤트 조율)
  dev/      확률 검증 도구
  eventBus.js  모듈 간 통신 (pub/sub)
  main.js      조립 전용
```

## 다음 단계
2. revealStateMachine (공개 연출 로직) → 3. 책상/페이지 화면 → 4. SSR 연출·속독·저장
