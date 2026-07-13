# 미완(未完)의 서고 — 가챠 시스템

이야기가 죽으면 — 연재가 끊기고, 게임이 섭종하고, 책이 절판되면 —
그 세계의 영웅들은 마지막 페이지를 받지 못한 채 이 서고로 흘러든다.
당신은 이 서고의 마지막 사서. 사서의 펜은 문장이 아니라 확률을 쓴다.

순수 클라이언트 사이드(HTML/CSS/JS, 빌드 도구 없음) — GitHub Pages 배포용.

## 플레이
- **한 장(張) 복원 / 합본 복원(10장)**: 반향을 소모해 바랜 페이지를 소환
- **페이지 탭**: 끊긴 문장 공개 → 다시 탭 → 사서의 펜이 결말을 이어 씀
- **낭독(朗讀)**: 자동으로 한 장씩 차례로 복원 (탭으로 끼어들기 가능)
- **속독(速讀)**: 전부 즉시 공개
- **서고 열람**: 복원한 이야기들의 도감
- **사서의 언약**: 90장 안에 절창(SSR) 1장 확정 / 합본은 일화(SR) 이상 1장 보장
- 진행 상황은 브라우저에 자동 저장됩니다 (localStorage)

## 로컬 실행
ES 모듈을 쓰므로 file:// 이 아니라 로컬 서버로 열어야 합니다.
```bash
python3 -m http.server 8000   # → http://localhost:8000
```

## 콘솔 디버그 (F12)
- `debug.state()` — 반향 / 언약 / 서고 현황
- `debug.verifyRates(100000)` — 설정 확률 vs 실측 확률 시뮬레이션
- `debug.resetSave()` — 세이브 초기화 (시연용)

## 구조
```
src/
  config/        확률·연출박자·캐릭터·장르·문구 (전부 데이터)
  core/          rng + gachaEngine (순수 함수 — 언약/합본 보장)
  state/         gameState (상태 변경의 유일한 경로 + localStorage 영속화)
  input/         gachaController (검증→엔진→상태→이벤트 조율)
  presentation/  revealStateMachine(연출 로직) / pageView / deskView
                 autoRevealDriver(낭독) / effectsView(SSR 화면연출) / libraryView(도감)
  dev/           확률 검증 도구
  eventBus.js    모듈 간 통신 (pub/sub) — 이벤트 계약은 EVENTS 상수 참조
  main.js        조립 전용
styles/          base / desk / page / library
assets/characters/  캐릭터 일러스트 (image 필드로 연결, 없으면 CSS 실루엣)
```

## 캐릭터/연출 확장
- 캐릭터 추가: `src/config/characters.data.js`에 항목 추가만으로 끝
- 일러스트: `assets/characters/`에 이미지 → `image` 필드에 경로
- 전용 연출: `styles/page.css`에 `.preset-이름` 규칙 → `revealPreset` 필드에 이름
- 연출 속도: `src/config/reveal.config.js`
- 확률/천장/비용: `src/config/gacha.config.js`
