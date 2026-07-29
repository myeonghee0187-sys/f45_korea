# F45 코리아 랜딩 페이지 현재 상태

마지막 업데이트: 2026-07-29

## 구현 완료

- index.html, style.css 초안: 헤더, 히어로, WHAT F45 KOREA, 마퀴 밴드, 지점 배지, 지점 찾기(검색+지도), 이용 절차(6단계), 앱 다운로드, 푸터 섹션 구조
- AGENTS.md의 기술 스택·검증 명령 섹션을 실제 프로젝트(빌드 도구 없는 정적 HTML/CSS/JS) 기준으로 채움
- CLAUDE.md 생성(@AGENTS.md 임포트 + Claude Code 전용 규칙)

## 구현 중

- 없음

## 확정된 UX 정책

- 없음(design-analysis.md "아직 확인하지 못한 내용" 참고 — 메뉴 활성 표시, 버튼 hover/focus/disabled, 캐러셀·마퀴 트리거 방식 모두 미확정)

## 사용 중인 라이브러리

- 없음(바닐라 HTML/CSS/JS, 빌드 도구·패키지 매니저 없음)

## 저장 데이터

- 없음(localStorage 미사용)

## 알려진 문제

- index.html의 이미지 경로가 실제 img/ 폴더 파일명과 다름(예: `pipeline.jpg`, `westhollywood.jpg`, `docklands.jpg` 등 → 실제 파일은 `img/phase_pipline.jpg`, `img/phase_west.jpg`, `img/phase_docklands.jpg` 등) → 브라우저에서 이미지가 깨짐
- "지점 라인업" 배지가 6개(West Hollywood·Fusion·Docklands·Lonestar·The Nines·Pipeline)뿐이라 design-analysis.md에서 확인된 PHASE 카드 7개(ANGRYBIRD 포함) 구성과 다름
- "WHAT F45 KOREA" collage가 실제 img_korea 5장(intro_a/e/r/k/o.jpg, K-O-R-E-A 순서) 대신 linear-gradient placeholder로 대체되어 있음
- "지점 찾기" 지도가 실제 `img/map.jpg` 대신 인라인 SVG placeholder이고, 확인된 실제 지점 6곳(교대·역삼·신사·청담·강남·보라매) 리스트가 없음
- 푸터가 확인된 실제 정보(대표자 김예진/Maier Joseph Robert, 사업자등록번호 811-86-01984, 소셜 아이콘 5종 이미지)가 아닌 임의 placeholder 주소·텍스트로 채워져 있음
- 앱 다운로드 섹션이 실제 phone01~06.png 스크린샷·6단계 캐러셀 대신 CSS로 그린 가짜 QR 코드로 대체되어 있음
- style.css의 색상·폰트·간격·라운드 값이 design-analysis.md 디자인 토큰과 일치하는지 아직 항목별로 대조하지 않음
- 모바일(360px)·태블릿(768px) 레이아웃 미확인(Figma 원본 노드가 PC 1920px 전용이라 별도 확인 필요 — design-analysis.md에도 동일하게 명시된 미해결 사항)

## 다음 작업

1. index.html을 design-analysis.md에서 확인된 사실 기준으로 재작성(실제 이미지 경로, PHASE 카드 7개, 실제 지점 6곳, 실제 푸터 정보)
2. style.css를 디자인 토큰(색상·폰트·간격·라운드·그림자) 값과 항목별로 대조
3. 360px·768px·1280px 기준 반응형 확인 및 수정
4. hover·focus·disabled 등 디자인에 없는 상태는 임의 구현하지 않고 사용자에게 확인 후 진행

## 마지막 검증 결과

- 실행 명령: 없음(이번 세션은 AGENTS.md·CLAUDE.md 문서 정리만 진행, index.html 변경 없음)
- 결과: 미실시
- 확인 화면: 미실시(360px/768px/1280px 모두 미확인)
- 확인하지 못한 부분: "알려진 문제" 전체 항목
