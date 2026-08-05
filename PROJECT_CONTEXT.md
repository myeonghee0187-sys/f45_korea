# F45 코리아 랜딩 페이지 현재 상태

마지막 업데이트: 2026-08-06

## 구현 완료

- `index.html` 전면 재작성: 헤더, 히어로(체험권 신청 CTA 포함), WHY F45 KOREA(intro_k/o/r/e/a.jpg 5장, K-O-R-E-A 순서), 마퀴(확인된 문구 "누구나 시작할 수 있어요 · F45 KOREA"), 이번 PHASE 7카드(phase_pipline·lonestar·docklands·fusion·thenines·west·angrybird.jpg), 지점 찾기(도시 드롭다운 + 검색 + 주변 매장 찾기 + 지점 6곳 리스트 + map.jpg), 입문자 케어 가이드 01~06(보라색 알파 단계), 앱 설치(phone01~06.png 캐러셀 + 인디케이터), 푸터(대표자·사업자등록번호·소셜 5종·메뉴·저작권)
- `css/style.css` 전면 재작성: `:root` 토큰을 design-analysis.md 확인값(teal #008ba3, lavender #5b5ceb, bg #f8f9fa, text #0a0913 등)으로 교체, `@font-face`로 Pretendard(woff2)·Montserrat(ttf) 로컬 폰트 연결, 버튼/카드/라운드 값을 확인된 스펙으로 반영, hover/focus-visible/active/disabled 상태 신규 추가, `prefers-reduced-motion` 대응 추가
- `js/app.js` 신규 작성: 도시 드롭다운(열기/닫기/선택/외부클릭·Escape 닫기), 지점 검색+도시 필터 결합 필터링, 검색어 없을 때 검색 버튼 disabled, 주변 매장 찾기(필터 초기화), 트라이얼 앱 6단계 캐러셀(좌우 화살표+인디케이터 dot 클릭)
- 모든 클래스/아이디를 snake_case로 통일(기존 kebab-case 잔재 정리)
- **2026-07-30**: 로고 파일 교체(`assets/icons/logo_1.svg` 삭제 → `logo.svg` 신규) 대응, 헤더/푸터 `index.html`의 로고 참조를 `logo.svg`로 수정
- **2026-07-30**: Figma MCP 재인증 후 헤더(`node 632:378`)·히어로(`node 632:394`) 원본을 실측 대조해 아래 불일치를 수정
  - 헤더/푸터 로고 크기가 실측(75×57px)보다 작게(헤더 32px, 푸터 28px 높이) 렌더링되던 문제 수정 → `css/style.css`의 `.logo`, `.logo img`, `.footer_logo img`를 75×57px + 10px 패딩(헤더)으로 교체
  - 히어로 배경을 3분할 이미지 콜라주(phase_pipline/fusion/thenines.jpg)에서 실제 디자인대로 풀블리드 단일 배경으로 교체하고, 새로 업로드된 `assets/imges/hero.mp4`를 배경 영상으로 반영(`autoplay muted loop playsinline`, `prefers-reduced-motion: reduce`에서 숨김 처리)
  - 디자인에 없던 원형 "F45/KOREA" 배지(`hero_badge`)를 제거(Figma 원본에 해당 요소 없음 확인)
  - 히어로 타이틀 폰트 크기를 실측값 88px로, 텍스트/버튼 정렬을 좌측→하단 중앙으로 수정(Figma 원본이 중앙 정렬)
- **2026-07-30**: 히어로 영상 코덱 문제 및 접근성 폴백 보완
  - 업로드된 `hero.mp4`가 확장자만 mp4이고 실제로는 QuickTime 컨테이너(`ftyp qt`)라 대부분 브라우저에서 재생되지 않던 문제를 발견 → macOS `avconvert`(PresetPassthrough)로 코덱 재인코딩 없이 표준 MP4 컨테이너(`ftyp mp42/isom`)로 리먹싱해 교체(코덱 H.264/AAC, 해상도 1620×1080 그대로 유지)
  - `hero.mp4`에서 정지 프레임을 추출해 `assets/imges/hero_poster.jpg` 신규 생성 → `<video poster>`로 연결하고, `prefers-reduced-motion: reduce`일 때 `.hero` 배경 이미지로도 사용(이전엔 빈 그라데이션만 보여 동작 줄이기 사용자에게 아무 이미지도 안 보이던 문제 개선)
  - CSS 버그 수정: reduced-motion용 `.hero` 배경 규칙을 앞쪽 미디어쿼리 블록에 넣었더니 뒤에 나오는 `.hero { background: ... }` 규칙에 밀려 무시되던 문제 → `.hero` 규칙 뒤에 별도 미디어쿼리로 재배치해 해결
- **2026-07-30**: WHY F45 KOREA 섹션(`node 632:400`)을 Figma와 실측 대조해 전면 수정
  - 220px 균등 그리드 + K/O/R/E/A 대형 글자 배지 구조(디자인에 없던 요소)를 제거하고, 400×400px 대형 사진 5장이 좌우 지그재그로 배치되고 각 사진 옆에 제목+2줄 설명이 나란히 놓이는 실제 구조로 교체(`korea_row_k/o/r/e/a`)
  - 각 카드의 2줄 설명 문구(예: "과학 기반 기능성 트레이닝 / 근육과 심혈관 건강을 동시에 개선" 등 5세트)를 Figma에서 새로 확인해 추가 — 기존엔 이 문구들이 HTML에 전혀 없었음
  - 사진/텍스트 카드별 회전(K:2deg, O:-2deg, R:-2deg, E:2deg, A:2deg), 행간 간격(4px), 섹션 배경 대각선 그라데이션, 타이틀 크기(영문 30px/한글 20px, 기존엔 반대로 되어 있었음)를 실측값으로 수정

- **2026-08-06**: 지점 찾기(`#locator`, node 632:570)·앱 설치(`#app`/trial, node 632:705) 두 섹션을 Figma 재실측해 전면 재구현
  - 지점 찾기:
    - 컨테이너를 공용 `.wrap`(1440 max-width + 좌우 40px 패딩)에서 전용 `.locator_inner`(1440 max-width, 패딩 없음)로 교체 — 기존 `.wrap`을 쓰면 콘텐츠 실폭(500+940=1440px)이 가용폭(1360px)을 넘어 가로 스크롤이 생기는 문제를 확인해 수정
    - 컨트롤 영역 마크업을 Figma 중첩 구조(도시 드롭다운 → `.locator_search_wrap`(gap 28) → 검색폼(gap 8)+주변매장찾기)로 재구성 — 기존엔 드롭다운과 검색창 사이 gap이 28px이 아닌 8px로 잘못 그룹핑돼 있었음
    - "검색" 버튼을 실측대로 lavender-5% 배경 + lavender 테두리 + 검정 텍스트로 수정(기존엔 lavender 단색 배경 + 흰 텍스트로 디자인과 다르게 구현돼 있었음)
    - 검색 인풋 폰트를 Montserrat 우선(Pretendard 폴백)으로 수정(Figma가 Montserrat 지정)
    - "상세페이지 보기" 버튼 배경을 `#fff`에서 투명으로 수정(리스트 배경 `--color-bg`와 동일 톤이어야 함)
    - 지점 리스트(`.branch_list`)를 지도 이미지와 동일한 627px 높이로 고정하고 `overflow-y:auto` 스크롤 적용 — Figma의 `map_txt`/`map_img`가 둘 다 h-627로 명시돼 있고 6개 항목 실제 합계(약 774px)가 이를 초과해 스크롤 영역임을 확인, 스크롤바는 얇은 lavender 색상으로 스타일링(Figma의 우측 세로 라인 요소를 네이티브 스크롤바 스타일로 재해석)
  - 앱 설치(`#app`):
    - 기존 구현("F45 Korea (new) 만나보기" 타이틀 + 1~6단계 텍스트 목록 + 체험권 신청하기 버튼 + 겹친 폰 이미지 2장)이 Figma 원본과 완전히 달라 전면 교체
    - Figma 실측대로 단일 폰 목업(282×570, `phone01~06.png` — 이미 정확한 282×570px 합성 목업으로 준비돼 있던 로컬 에셋 확인 후 그대로 사용) + "01/06" 형태 페이지 번호 + "F45 - Korea (new) 모바일 앱 설치 / 설치는 1분이면 충분해요" 문구 + App Store/Play Store 버튼(`apple.png`/`playstore.png`, 실측 크기와 로컬 에셋 크기 일치 확인) + 좌우 화살표(`left.png`/`right.png`)·인디케이터 dot(활성 32×16 teal pill, 비활성 16×16 `#ddd`)로 재구성
    - Figma 디자인에 없던 "체험권 신청하기" CTA 버튼은 제거(PRD 9장 사용자 흐름에서도 체험권 CTA는 히어로 영역 전용으로 명시돼 있어 중복이 아니라 원래 이 섹션에 없는 요소였음을 확인)
    - `js/app.js`에 `initTrialCarousel()` 신규 작성: 좌우 화살표·인디케이터 dot 클릭 시 phone 이미지·"01/06" 숫자·활성 dot을 함께 갱신(6장 순환)

## 구현 중

- 없음(이번 라운드 범위 내 작업 완료)

## 확정된 UX 정책 (이번 세션에서 사용자 확인)

- 반응형: **이번 라운드는 1280px(PC)만 구현**. 360px 모바일은 Figma 모바일 프레임 완성 후 별도 진행, 768px 태블릿은 범위 제외(PRD 14장의 360/768 전체 반응형 요구와 별개로 이번 작업 범위에서 사용자가 명시적으로 축소 결정)
- hover/focus/active/disabled: 디자인에 정의 없음 → 브랜드 컬러(teal/lavender) 기준으로 직접 설계해 구현(사용자 승인)
- 지점 검색 결과 없음(빈 상태) UI: 별도 확인 전까지 미구현 — 현재는 필터링 로직만 동작하고 결과 0건이면 리스트가 비어 보임(안내 문구 없음)
- 마퀴/캐러셀 트랜지션: 마퀴는 기존 26s linear 유지, 캐러셀은 기본 즉시 전환(트랜지션 애니메이션 없음)으로 구현
- 소셜 아이콘: 5개(utube·facebook·twitter·instagram·in) 확정, design-analysis.md의 "6개" 서술은 부정확했던 것으로 확인
- "상세페이지 보기" 버튼: 실제 이동 없이 UI만(버튼 요소, 클릭 핸들러 없음)
- 헤더 햄버거/로그인: UI만 존재, 열림/닫힘 등 실제 토글 기능 없음
- 푸터 주소/전화/이메일: 확인된 사실 없음 → 원래 없는 정보이므로 넣지 않음(대표자·사업자등록번호만 표기)
- JS 파일 구조: `js/app.js`를 실제로 사용(인라인 스크립트 대신 분리 파일), `css/common.css`/`css/pages.css`/`js/storage.js`는 이번 랜딩 작업 범위에서는 비워둔 채 유지(추후 다른 페이지 작업 시 사용 예정)

## 사용 중인 라이브러리

- 없음(바닐라 HTML/CSS/JS, 빌드 도구·패키지 매니저 없음)

## 저장 데이터

- 없음(localStorage 미사용, 도시/검색 필터는 세션 내 DOM 상태로만 유지)

## 알려진 문제 / 남은 확인 사항

- **Figma 재확인 완료(헤더·히어로·WHY F45 KOREA·지점 찾기·앱 설치)**: `node 632:378`(header), `node 632:394`(hero), `node 632:400`(WHY F45 KOREA), `node 632:570`(지점 찾기), `node 632:705`(앱 설치)를 실측 대조 완료. PHASE 섹션 제목 카피, 가이드 03단계("식사") 설명 문구, 푸터 등 나머지 섹션은 아직 대조하지 않았으므로 확인 필요.
- 지점 찾기 "우측 세로 라인" 요소(Figma `Line2`, map_txt 우측 5px 지점에 147px 높이): 정확한 색상·용도(스크롤바 힌트로 추정)를 100% 확인하지 못해 브라우저 네이티브 스크롤바를 얇은 lavender 색으로 스타일링하는 것으로 재해석해 구현함 — 디자인과 정확히 같은 그래픽은 아님.
- **브라우저 실측 방법 변경**: 이번 환경엔 여전히 chromium-cli·Playwright가 없지만, 사용자 PC의 실제 Chrome(VS Code Live Server, `127.0.0.1:5500`)을 macOS `osascript`(Chrome을 새 탭/URL로 열기)와 `screencapture`로 직접 캡처해 시각적으로 확인하는 방식을 이번 라운드에 사용함. Apple Events를 통한 JS 실행은 Chrome/Safari 모두 기본적으로 막혀 있어 `console.error` 등은 이 방법으로 직접 읽지 못함(콘솔 탭을 스크린샷으로 열어보는 방식으로 우회 가능하나 이번엔 레이아웃 확인에 집중함).
- 히어로 배경 비디오: 실제 Chrome에서 자동재생되는 것까지 스크린샷(연속 캡처 프레임이 서로 다름)으로 확인함.
- WHY F45 KOREA 각 행의 정확한 픽셀 오프셋(Figma의 `pl-20`, `pl-60`, `pr-100` 등 절대 좌표)은 근사치로 구현함 — 디자인 자체가 카드마다 손으로 배치한 듯한 "느슨한" 레이아웃이라 완전히 동일한 px까지는 맞추지 않았음, 필요시 정밀 조정 가능.
- 360px·768px 레이아웃 없음(위 "확정된 UX 정책" 참고, 사용자 결정으로 이번 범위 제외)
- 가이드 섹션의 "좌측 타이틀 sticky + 우측 카드 쌓임" 스크롤 연출은 구현하지 않음(design-analysis.md도 추정으로만 기록, 이번 세션에서 별도 확인/지시 없었음) — 현재는 세로 목록으로만 표시
- guide 카드 "우측 상단 128px 숫자" 스펙은 폰트 크기 96px로 근사 구현(940px 카드 폭 대비 128px 숫자가 비율상 과도하게 커 보여 시각적으로 조정 — Figma 재확인 시 정확한 값으로 교체 필요)

## 다음 작업

1. Figma 재확인 범위를 나머지 섹션(PHASE 제목 카피, 가이드, 푸터)으로 확장해 카피·수치 대조
2. 키보드 Tab 순서·focus-visible, 콘솔 에러(F12로 직접) 확인 — Apple Events 경로로는 콘솔 로그를 못 읽으므로 사용자가 직접 개발자 도구를 열어 확인하는 편이 정확함
3. 360px 모바일 Figma 프레임이 나오면 반응형 레이아웃 추가 구현
4. 지점 검색 빈 상태 UI 디자인 확정되면 반영

## 마지막 검증 결과

- **2026-08-06(지점 찾기·앱 설치 재구현)**: `python3 -m http.server`/VS Code Live Server(`127.0.0.1:5500`)로 정적 서빙 후 사용자 실제 Chrome을 `open -a`+`osascript`(URL 이동)+`screencapture`로 캡처해 두 섹션을 Figma 스크린샷과 나란히 육안 대조함 — 지점 찾기(드롭다운·검색창·검색 버튼·주변 매장 찾기·지점 리스트 스크롤·지도)와 앱 설치(폰 목업·01/06 번호·타이틀·스토어 버튼·좌우 화살표·인디케이터) 모두 레이아웃·색상·타이포가 일치함을 확인. `git diff`로 `trial_left/trial_tit/trial_steps/trial_cta` 등 제거 대상 클래스가 HTML·CSS 어디에도 남지 않았음을 grep으로 확인.
- 캐러셀 클릭 인터랙션(화살표·dot 클릭 시 이미지·번호·활성 dot 갱신)은 코드 리뷰로 로직을 확인했으나, Apple Events로 Chrome에 클릭 이벤트를 보내는 것이 접근성 권한 문제(`osascript`가 System Events 제어 권한 없음, -1719 오류)로 막혀 있어 **실제 클릭 동작은 브라우저에서 직접 확인하지 못함** — 사용자가 화살표/점을 눌러 폰 이미지·"0N/06" 숫자·활성 dot이 함께 바뀌는지 확인 필요.
- 실행 명령: 파일시스템 기준 에셋 경로 전수 대조(전부 OK), `avmediainfo`로 hero.mp4 코덱 확인(H.264/AAC), 사용자 실제 Chrome(Live Server 5500)을 `osascript`+`screencapture`로 캡처해 헤더 로고 크기·히어로 영상 재생·WHY F45 KOREA 레이아웃을 시각적으로 직접 확인함
- 360px/768px 화면 비교: **미실시**(사용자 결정으로 이번 범위 제외), 1280px은 스크린샷으로 확인
- 키보드 Tab 순서·focus-visible, 콘솔 에러 로그: **미실시**(Apple Events로 JS 실행이 막혀 있어 화면 캡처로는 확인 불가 — 사용자가 직접 F12로 확인 필요)
- 확인하지 못한 부분: 위 "알려진 문제 / 남은 확인 사항" 전체, 트라이얼 캐러셀 실제 클릭 동작
