# [f45] 디자인 분석표

## 확인한 자료

- 디자인 원본: [@https://www.figma.com/design/xYrHj7h7ULDihhqhQmSrX2/%EC%86%A1%EB%AA%85%ED%9D%AC?node-id=833-637&m=dev]
- 확인한 화면: [main]
- 실제 에셋 위치: [f45/img (이미지·아이콘), f45/Montserrat, f45/Pretendard-1.3.9 (2) (폰트)]

## 화면 목록

|PC 랜딩(홈)|브랜드 소개로 신뢰를 준 뒤 체험 신청 또는 지점 찾기로 유도|체험권 신청 CTA 클릭 · 지점 검색/주변 매장 찾기 · 지점 "상세페이지 보기" 이동 · 앱스토어/플레이스토어 링크 클릭 · 캐러셀 좌우 이동|기본, 지점 검색 결과 없음(빈 상태), 지도/이미지 로딩|

## 공통 영역

- 헤더: 로고(F45 워드마크 SVG 2개 조합), 메뉴(F45 KOREA · 지점 찾기 · 체험권 · 로그인, Montserrat Bold 20px), 항목 내부 패딩 10px·항목 간격 20px, 좌우 패딩 40px, 우측 햄버거 아이콘(두께 3px × 너비 25px 바). 배경 rgba(0,139,163,0.2), 높이 100px. 현재 메뉴 활성 표시 방식은 확인 안 됨
- 푸터: 배경 rgba(0,139,163,0.2), 좌우 패딩 80px·상하 패딩 100px. 로고 + 소셜 아이콘 6개(유튜브·페이스북·트위터·인스타그램·링크드인, 각 24px, 간격 16px) → 대표자: 김예진, Maier Joseph Robert / 사업자등록번호: 811-86-01984 → 메뉴(개인정보 수집 및 이용 동의 · 이용약관 · 개인정보처리방침[Bold], 간격 16px·패딩 8/12px) → 저작권 문구 "F45 Korea @ 2026. All rights reserved."
- 공통 버튼: 채움형(bg #008ba3, 흰 텍스트, 라운드 없음/직각, 예: "체험권 신청하기" 패딩 86px/20px), 아웃라인형(border #5b5ceb, 텍스트 #0a0913, 라운드 20px, 패딩 20px/14px, 예: "검색", "도시 선택", "상세페이지 보기"), 아웃라인+채움 혼합("주변 매장 찾기" = bg #5b5ceb 채움 + 라운드 20px), App/Play Store 버튼(border #008ba3, 라운드 없음, 높이 50px·폭 144px). hover·focus·disabled 상태는 정적 디자인이라 확인 안 됨 → 질문 필요
- 공통 카드: (1) img_korea 카드 - 400×400 정사각 이미지 + 라운드 20px + ±2deg 회전(rotate) 효과, "WHY F45 KOREA" 섹션에서 K·O·R·E·A 순서로 5장 배치. (2) phase 카드 - 폭 300px, 상단 이미지 300×375(위쪽만 라운드 50px) + 하단 회색(#f2f2f2) 텍스트 영역 높이 140px(아래쪽만 라운드 50px). (3) guide 카드 - 폭 940px·라운드 22px, 보라색(#5b5ceb) 계열 배경이 01~05번은 투명도 50/65/75/85/90%, 06번은 불투명 100%로 갈수록 진해짐, 우측 상단에 128px 크기 숫자 표기


## 디자인 토큰

- 배경색: [#f8f9fa (color/text/white, 페이지 기본 배경)]
- 본문색: [#0a0913 (color/text/black)]
- 강조색: [#008ba3 teal(CTA·버튼), #5b5ceb lavender(아웃라인·지도 UI·가이드 카드)] — 알파 변형 다수: teal-20 rgba(0,139,163,0.2)(헤더/푸터), teal-45 rgba(0,139,163,0.45)(마퀴), lavender-5/50/65/75/85/90%(검색버튼·가이드 카드 단계별 배경)
- 서피스색: [#f2f2f2 (phase 카드 텍스트 영역), #ddd (캐러셀 비활성 인디케이터)]
- 제목 폰트: [Montserrat — Bold/SemiBold/Medium/Regular]
- 본문 폰트: [Pretendard — Regular/Medium/SemiBold/Bold], 스토어 버튼 라벨은 Montserrat SemiBold로 변경(기존 Rubik에서 교체)
- 기본 간격: [4px 그리드 기반. 확인된 값: 4, 8, 10, 12, 16, 20, 24, 28, 40px(컴포넌트 내부·요소 간), 100~200px(섹션 상하 패딩)]
- 라운드: [아웃라인 버튼 20px, 채움형 버튼·스토어버튼 0px(직각), img_korea 카드 20px, phase 카드 50px, guide 카드 22px, 폰 목업 43px]
- 그림자: [도시 선택 드롭다운 리스트(node 755:679, city_all)에 사용 — X 0px, Y 4px, blur 6.2px, color rgba(102,102,102,0.2). 그 외 위치는 box-shadow 클래스 확인 안 됨]

## 반응형

- 360px: [이번에 확인한 노드(632:377)는 PC 전용 1920px 고정 폭 프레임 → 모바일 디자인 노드 별도 확인 필요]
- 768px: [확인 안 됨 → 태블릿 전용 노드 필요]
- 1280px: [확인 안 됨. 단, 섹션 내부 콘텐츠 폭은 1920px 프레임 안에서 1440px로 중앙 정렬됨]

## 인터랙션

- 메뉴: [헤더 메뉴는 열기·닫기·현재 위치 표시 방식 확인 안 됨(햄버거 아이콘만 존재). 단, "도시 선택" 드롭다운(node 755:679, city_all)은 클릭 시 리스트 노출로 확인됨 — 항목: 전체(활성 상태, bg #ebebfe·text #5b5ceb) · 서울 · 경기 · 광역 · 충청 · 남부(bg #f8f9fa·text #0a0913), 각 항목 패딩 pl20/pr91/py12, 라운드 20px, 그림자 있음(위 항목 참고)]
- 버튼: [hover·pressed·disabled 상태 확인 안 됨]
- 스크롤: [마퀴 영역("누구나 시작할 수 있어요 · F45 KOREA" 반복 문구)이 가로 스크롤 컨테이너 구조 → 자동 슬라이드 추정, 속도/방식 확인 안 됨. 가이드 섹션은 좌측 타이틀이 sticky, 우측 6장 카드가 240px 간격으로 쌓여 있어 스크롤 연출 추정 — 정확한 트리거는 확인 안 됨]
- 애니메이션: [트라이얼(앱 설치) 영역에 6단계 캐러셀 인디케이터(01/06 표기, 활성 pill 32×16 teal, 비활성 원 16×16 #ddd) + 좌우 화살표 버튼 → 좌우 이동 캐러셀로 추정, 트랜지션 값은 확인 안 됨]

## 에셋

- 로고: [f45/img/logo_1.svg]
- 이미지: [f45/img/intro_a·e·r·k·o.jpg (img_korea 5장, K-O-R-E-A 순서), f45/img/phase_pipline·lonestar·docklands·fusion·thenines·west·angrybird.jpg (이번 PHASE 카드 7장), f45/img/map.jpg (지점 찾기 지도), f45/img/phone01~06.png (트라이얼/앱 스크린샷 6장)]
- 아이콘: [f45/img/down.png(도시 선택 화살표), location.png(주변 매장 찾기), search.png(검색 돋보기), right.png·left.png(캐러셀 좌우 화살표), ham.png(헤더 햄버거), up.png, utube.png·facebook.png·twitter.png·instagram.png·in.png(소셜 5종), apple.png·playstore.png(App/Play Store 버튼 아이콘)]
- 폰트: [Montserrat, Pretendard 2종 모두 로컬 폰트 파일로 로드 — f45/Montserrat/static/*.ttf, f45/Pretendard-1.3.9 (2)/web/static/woff2/*.woff2(웹용) 또는 public/static/*.otf(로컬용). 스토어 버튼 라벨은 Rubik에서 Montserrat SemiBold로 교체되어 별도 폰트 불필요]

## 확인된 사실

- 메인 랜딩 프레임(node 632:377, "pc_design")은 1920px 고정 폭이며, 내부 콘텐츠는 1440px 폭으로 중앙 정렬됨
- "WHY F45 KOREA" 섹션의 img_korea 카드 5개는 K-O-R-E-A 순서로 배치되어 부제 "다섯 글자에 담긴, 우리가 다른 이유"와 의도적으로 맞춘 구조(각 카드: KINETIC TRAINING / OPTIMIZED 45 MIN / RELATIONSHIPS / EXPERT COACHES / ADAPTIVE PROGRAM)
- "이번 PHASE" 섹션은 7개 카드(PIPELINE·LONESTAR·DOCKLANDS·FUSION·THE NINES·WEST HOLLYWOOD·ANGRYBIRD)로 구성됨 — 이전에 "지점 로고 배지"로 추정했던 이미지들은 실제로는 이 phase 프로그램 카드용 대표 이미지였음(정정)
- "지점 찾기" 섹션에는 F45 교대·역삼·신사·청담·강남·보라매 6개 지점이 주소·전화번호·"상세페이지 보기" 버튼과 함께 리스트업됨, 우측에 940×627 지도 이미지
- "입문자 케어 가이드"는 01~06번 카드(설문조사·준비물·식사·입장·강도·코치 케어)로 구성되고 보라색 배경 농도가 갈수록 진해짐(기존 추정과 일치, 정확한 투명도 값 확인됨)
- 트라이얼(앱 설치 유도) 섹션 문구는 "F45 - Korea (new) 모바일 앱 설치 / 설치는 1분이면 충분해요", 6단계 캐러셀 중 1번째 화면
- "도시 선택" 드롭다운 리스트(전체·서울·경기·광역·충청·남부)에 그림자 효과 확인됨(X0/Y4px/blur6.2px/rgba(102,102,102,0.2)) — 디자인 전체에서 그림자가 쓰인 유일하게 확인된 위치
- 실제 에셋 파일이 f45/img에 반영됨: 로고(logo_1.svg), img_korea 5종, phase 카드 이미지 7종, 지도(map.jpg), 앱 스크린샷(phone01~06.png), 소셜/스토어/화살표 아이콘 다수

## 아직 확인하지 못한 내용

- 모바일(360px)·태블릿(768px) 전용 레이아웃 (이번 노드는 PC 전용)
- 버튼·메뉴의 hover·focus·pressed·disabled 상태
- 마퀴 및 가이드 카드 스크롤 연출의 실제 트리거·속도·이징 값