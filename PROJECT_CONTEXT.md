# F45 KOREA 프로젝트 현재 상태

마지막 업데이트: 2026-09-20

## 작업 기준

- 작업 브랜치: `feature/f45-final-completion`
- 시작 기준 `origin/main`: `d12aaaeaa8e7c46ec7f7271d42034fca263c1b14`
- 승인된 `F45_CODEX_ASTRA_FINAL_PROMPT.txt`의 Final Completion 범위를 구현합니다. 이전 문서의 ‘로그인·상세 UI만 제공’, ‘태블릿은 추후 작업’ 제한은 현재 범위에 적용되지 않습니다.
- 기술 스택: HTML·CSS·Vanilla JavaScript, 빌드 도구·package.json·백엔드 없음. GitHub Pages의 `/f45_korea/` 하위 경로를 고려한 상대 경로를 사용합니다.
- 최종 QA를 통과했습니다. 최종 커밋 SHA·push 결과는 작업 종료 보고와 Git 기록에서 확인합니다.

## 현재 구현

홈의 브랜드·PHASE·지점 찾기·Guide·앱 소개를 유지하면서 데모 회원가입·로그인·세션·로그아웃, 공통 헤더 상태, 모바일 메뉴 및 6개 지점 상세 화면을 추가했습니다. 기존 teal/lavender 토큰, Pretendard·Montserrat 로컬 폰트, 로고와 운동 이미지를 재사용합니다.

| 파일 | 역할과 이번 변경 |
|---|---|
| `pages/login.html` | 신규 데모 로그인, 이메일 저장, 로그인된 상태 안내 |
| `pages/signup.html` | 신규 회원가입·필수 동의·데모 개인정보 안내 |
| `pages/detail.html` | 기존 빈 파일에 6개 지점 공통 상세·없는 지점·no-JS 안내 구현 |
| `css/common.css` | 기존 빈 파일에 공통 헤더/메뉴·폼·버튼·상태·포인터 효과 스타일 구현 |
| `css/pages.css` | 기존 빈 파일에 인증·상세 반응형 레이아웃 구현 |
| `js/storage.js` | 기존 빈 파일에 검증·안전한 저장소 접근·비밀번호 해시·세션 관리 구현 |
| `js/auth.js` | 신규 폼·비밀번호 표시·전화 포맷·헤더·로그아웃·메뉴 제어 |
| `js/branch_data.js` | 신규 6개 지점 허용 목록과 데이터 |
| `js/branch_detail.js` | 신규 query 검증·상세 텍스트·전화·메타·오류 상태 |
| `js/interactions.js` | 신규 Hero/제목/이미지 등장·Spotlight·Magnet |
| `index.html` | 로그인 페이지·상세 링크·메뉴·main·빈 상태·인터랙션 연결, 강제 viewport 제거 |
| `css/style.css` | 기존 홈 디자인 유지, no-JS에서 내용을 숨기던 Guide 초기 상태 제거 |
| `js/app.js` | 기존 필터·Hero/앱 캐러셀·PHASE·로고 동작 유지 및 상태·접근성 보완 |
| `js/modal.js` | 로그인 모달 제거, 체험 안내 모달·포커스 순환·배경 비활성화 |
| `js/scroll_animations.js` | 기존 AOS/히어로/Guide 모션 유지, 폴백·모션 변경·정리 보완 |
| `PRD.md`, `PROJECT_CONTEXT.md` | 현재 범위·데이터·검증·제한으로 갱신 |

Header/Footer는 fetch 없이 각 HTML에 직접 포함합니다. 기존 빈 `pages/onboarding.html`, `pages/search.html`은 이번 구현 페이지에 포함되지 않습니다.

## Demo Auth와 저장 구조

실제 회원 서비스와 연결하지 않는 브라우저 시연 기능입니다. 화면에 데모 안내를 표시하며 개인정보·검증값을 별도 서버로 전송하지 않습니다. 서버 인증·DB·권한 검증·기기 간 동기화·이메일/SMS 인증·비밀번호 찾기·OAuth·결제·예약은 없습니다.

`js/storage.js`의 v1 사용자 스키마:

```text
{
  id: UUID v4,
  name: trim한 2~30자 이름,
  email: trim 및 lowercase한 이메일,
  phone: 010으로 시작하는 11자리 숫자 문자열,
  passwordHash: 32바이트 파생 키의 base64,
  salt: 사용자별 16바이트 난수의 base64,
  termsAccepted: true,
  privacyAccepted: true,
  createdAt: ISO 날짜
}
```

세션은 다음 필드만 저장합니다. password·passwordHash·salt·phone·동의 정보를 세션에 넣지 않습니다.

```text
{ userId: UUID v4, name: 이름, email: 정규화 이메일, loggedInAt: ISO 날짜 }
```

| 저장 위치 | 키 | 용도 |
|---|---|---|
| localStorage | `f45_demo_users_v1` | 사용자 배열 |
| localStorage | `f45_demo_session_v1` | 현재 로그인 세션 |
| localStorage | `f45_saved_email_v1` | 이메일 저장 선택 시 이메일만 보관 |
| sessionStorage | `f45_signup_email_v1` | 가입 완료 이메일 일회 전달 |
| sessionStorage | `f45_signup_success_v1` | 가입 성공 문자열 `true`, 로그인에서 소비 후 제거 |

비밀번호 처리는 Web Crypto PBKDF2·SHA-256, **120,000회 반복**, 256비트 키, `crypto.getRandomValues(new Uint8Array(16))` salt를 사용합니다. 비밀번호 원문을 저장하지 않습니다. `crypto.randomUUID()` 미지원 시 암호학적 난수로 UUID v4를 만듭니다. 해당 v1 형식의 반복 수는 코드에 고정되어 있습니다.

모든 읽기는 필드·타입·값·중복 이메일/ID·해시 크기 등을 검증합니다. 세션은 저장된 사용자와 대조합니다. 손상된 키만 삭제하며 `localStorage.clear()`를 호출하지 않습니다. 저장소 차단·용량·암호화 실패를 사용자 오류 상태로 처리합니다. 지원 브라우저에서는 Web Locks로 여러 탭의 가입 쓰기도 직렬화합니다.

회원가입은 로그인 전달용 sessionStorage를 먼저 준비하고 사용자 쓰기에 실패하면 임시 값을 정리합니다. 등록 완료 후 로그인 화면의 이메일·성공 안내·비밀번호 포커스로 연결합니다. 로그인 후 홈으로 이동하며 새로고침과 페이지 이동 시 세션을 복구합니다. 이름 표시는 `textContent`를 사용합니다.

브라우저 데이터는 소유자가 직접 수정할 수 있으므로 해시 사용만으로 실제 인증 보안이나 접근 제어가 생기지 않습니다. 데모 정보만 입력하며 사이트 데이터 삭제 시 계정·세션도 사라집니다. Web Crypto를 사용할 수 있는 HTTPS 또는 localhost가 필요합니다.

## 공통 헤더·메뉴·모달

- 비로그인 상태는 로그인 페이지로 이동하는 a, 로그인 상태는 이름과 로그아웃 button을 표시합니다. 이름은 긴 경우에도 헤더 폭을 넘지 않게 처리합니다.
- 로그아웃은 세션 키만 지우고 현재 페이지를 유지합니다. 가입 데이터·저장 이메일은 유지하며 다른 탭에서도 storage 이벤트로 헤더 상태를 갱신합니다.
- 로그인된 사용자가 로그인/회원가입에 접근하면 폼 대신 이름, 홈 이동과 로그아웃을 제공합니다.
- 1024px 미만 메뉴는 toggle·Escape·외부/overlay·내부 링크로 닫히며 `aria-expanded`·버튼 이름을 갱신합니다. 데스크톱 전환 시 열린 상태를 초기화합니다.
- 메뉴의 `has_menu_open`과 체험 모달의 `has_modal_open`은 별도로 관리합니다. 모달을 열기 전에 메뉴를 닫습니다.
- 로그인 안내 모달은 삭제했습니다. 체험 안내 모달은 닫기 버튼 초기 포커스, Tab 순환, 배경 inert, Escape/overlay 닫기와 원래 CTA 포커스 복귀를 제공합니다.
- 실제 체험권 접수·구매가 아닌 F45 앱 설치 안내입니다.

## 지점 상세

`F45Branches`에 승인된 이름·주소·전화만 저장합니다. 홈 HTML의 `data-branch-id`·링크와 같은 데이터를 사용하며 홈 목록은 JavaScript 없이도 읽을 수 있습니다.

| slug | 지점명 | 주소 | 전화 |
|---|---|---|---|
| `gyodae` | F45 교대 | 서초대로51길 24 2,3층 | 0507-1334-6376 |
| `yeoksam` | F45 역삼 | 테헤란로14길 13 지하 1층 | 0507-1391-1451 |
| `sinsa` | F45 신사 | 도산대로 120 청호빌딩 지하 1층 | 0507-1334-6376 |
| `cheongdam` | F45 청담 | 도산대로 413 고영캠퍼스 지하 2층 | 0507-1421-0649 |
| `gangnam` | F45 강남 | 테헤란로84길 14 지하 1층 | 0507-1444-1657 |
| `boramae` | F45 보라매 | 보라매로5가길 16 3층 | 0507-1381-5238 |

단일 `pages/detail.html?branch=...`에서 정확한 허용 목록 조회로 렌더링합니다. 이름·주소·전화·breadcrumb·title·description·tel 링크를 선택된 데이터로 갱신합니다. 누락·잘못된 값·중복 branch query는 안내 상태로 전환하며 query 원문을 HTML이나 title에 넣지 않습니다.

상세는 Hero, 주소·전화·참고 위치 이미지, F45 트레이닝 소개, 첫 방문 안내, 홈 가이드 링크, 앱 스토어 링크와 체험 모달을 포함합니다. 기존 운동 이미지는 ‘F45 트레이닝 이미지’로 설명하며 지점 실내 사진이라고 주장하지 않습니다. 운영시간·가격·코치·시간표·주차·시설·후기는 임의로 추가하지 않았습니다.

현재 지도는 `assets/images/map.jpg` 참고 이미지입니다. 페이지에서 새 지도 API나 위치 권한을 사용하지 않습니다. 홈 ‘주변 매장 찾기’는 기존의 전체 목록 복원 동작을 유지하며 실시간 주변 위치 검색을 제공하지 않습니다. 사용하지 않는 예전 `js/locator_map.js`는 페이지에 로드하지 않습니다.

## 인터랙션과 유지한 동작

GSAP Core **3.12.5**를 재사용하고 AOS **2.3.4**는 기존 WHY 카드에만 적용합니다. 같은 요소를 두 라이브러리가 제어하지 않도록 추가 reveal 대상에서 AOS 요소를 제외합니다. ScrollTrigger·Lenis·ScrollSmoother·pin·scroll hijacking·React 또는 React Bits 패키지는 추가하지 않았습니다.

| Reference | 적용 위치 | Vanilla 구현 방식 | Mobile 처리 | Reduced Motion |
|---|---|---|---|---|
| BlurText/FadeContent 원리 | Hero 두 줄 제목 | 실제 텍스트 span, GSAP y/opacity, 0.12초 순차 등장 | 가벼운 1회 등장 | 즉시 표시 |
| FadeContent 원리 | 섹션 제목 | IntersectionObserver, GSAP y/opacity, 1회 | 동일한 1회 등장 | 즉시 표시 |
| SpotlightCard/GlareHover 원리 | PHASE·홈 지점·상세 이미지 카드 | 포인터 좌표를 CSS 변수·radial-gradient로 전달, rAF | 포인터 리스너 미등록 | 효과 미등록 |
| Magnet 원리 | Hero·인증 제출·상세 체험 CTA | 버튼 내부 span만 GSAP quickTo로 최대 6px 이동 | 포인터 리스너 미등록 | 효과 미등록 |
| FadeContent 원리 | 인증 이미지·상세 Hero/트레이닝 이미지 | opacity·y·scale 1.03→1, 1회 | 동일한 1회 등장 | 즉시 표시 |

포인터 효과는 1024px 이상·fine pointer·hover 가능·모션 감소 미사용 조건에서만 켭니다. 키보드 포커스에서 Magnet을 초기화하며 resize·설정 변경 시 리스너·대기 프레임·트윈을 정리합니다. tilt는 적용하지 않았습니다.

기존 Hero의 네이티브 scroll 기반 전환과 모바일 Guide reveal을 유지합니다. 앱 6단계 캐러셀은 기존 CSS transition·Vanilla JavaScript 방식이며 GSAP 캐러셀로 교체하지 않았습니다. 앱 번호·문구·폰 이미지·버튼·dots를 동기화하고 hover·focus·비활성 탭·화면 밖·모션 감소에서 자동 진행을 멈추도록 보완했습니다. PHASE의 wheel·mouse drag와 네이티브 터치 스크롤도 유지합니다.

HTML 기본 상태는 읽을 수 있으며 GSAP은 실행 직전에만 초기 애니메이션 상태를 적용합니다. AOS·GSAP CDN 실패와 no-JS에서 본문을 표시하고, 인증 폼에는 JavaScript 필요 안내와 기본 비활성 제출 버튼을 둡니다.

## viewport와 반응형 결정

작업 전 390px 모바일 시뮬레이션에서 기존 스크립트가 실제 viewport를 430px로 바꾸는 것을 확인했습니다. 이는 작은 화면에서 사이트 전체를 축소해 글자와 터치 영역을 줄이는 방식이므로 제거했습니다. 모든 페이지는 다음 표준 설정을 사용하며 확대를 막는 설정은 없습니다.

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

360~430px 실제 폭에서 레이아웃이 맞도록 홈·헤더·푸터·Guide를 보완하고 인증 입력과 모바일 홈 검색 입력은 16px 이상으로 표시합니다. 검수 기준은 360×800, 375×812, 390×844, 430×932, 768×1024, 1024×1366, 1280×800, 1440×900, 1920×1080입니다.

대비 보완은 기존 팔레트 안에서 처리했습니다. Guide 본문 대비는 1~6번 순서로 9.21/7.21/6.08/5.11/4.68/4.77:1, 푸터 5.61:1, 헤더 hover 5.34:1, 인증 CTA 5.53:1을 확인했습니다. Guide 1~5번은 어두운 글자·숫자, 6번은 흰 글자를 사용하고, 폼 경계는 teal로 표시합니다. 푸터 보조 글자 투명도를 0.65로 조정하고 상세 앱 섹션 eyebrow는 어두운 글자로 바꿨습니다.

## 실행한 QA — 2026-09-20

정적 서버 `python3 -m http.server 8000`, 설치된 Playwright와 실제 Chrome headless를 사용했습니다. 테스트 의존성·package.json은 저장소에 추가하지 않았습니다. 스크린샷·검수 스크립트·JSON은 `/tmp`에 저장하여 최종 커밋 대상에서 제외합니다.

| 검증 범위 | 실행 결과 | 확인 내용 |
|---|---|---|
| Auth Node VM + Web Crypto | PASS, 64개 확인 | 검증 규칙, 독립 PBKDF2 대조, UUID fallback, 중복·동시 가입, 세션·로그아웃, 저장소 손상·읽기/쓰기 실패·rollback |
| Auth 실제 Chrome | PASS, 70개 확인 | 빈/잘못된 입력, 동의·중복, Enter 가입/로그인, 이메일 전달·비밀번호 포커스, 표시 토글·전화 포맷, 세션·다른 탭 로그아웃·이메일 저장/해제 |
| 모바일 메뉴 실제 Chrome | PASS, Auth QA에 포함 | 열기·같은 버튼 닫기·Escape·overlay·Tab·내부 링크·resize·스크롤 잠금·모바일 로그아웃 |
| 키보드·긴 이름 | PASS, 추가 검수 | Tab/Space/Enter만으로 가입·로그인, 필드 포커스 outline, 30자 한글 이름의 9 viewport 헤더 겹침·넘침 없음 |
| 지점 상세 | PASS, 20개 항목 | 6개 지점, 7개 잘못된 query, 모달/포커스, 360·768·1280px, no-JS·GSAP 차단 폴백 |
| 인터랙션 | PASS, 담당 검수 | 5가지 효과, reduced motion, CDN 실패, resize 리스너 정리 |
| 9 viewport × 4페이지 자동 계측 | PASS, 36화면 | 문서 폭=viewport, 넘침·텍스트 잘림 탐지·중복 id·깨진 이미지·콘솔/내부 요청 오류 없음 |
| 홈 필터·링크·체험 모달 | PASS, 추가 회귀 | Enter·버튼·주소 검색·빈 결과·도시 필터·초기화, 실제 6개 상세 링크, Hero/앱의 체험 모달 |
| 앱 수동 조작 | PASS, 추가 회귀 | 6단계 번호·폰·버튼 동기화, 이전/다음 순환, 키보드 Home/End/ArrowRight |
| 모바일 Hero·도시 메뉴 | PASS, 추가 회귀 | 5초 자동 진행·화면 밖 정지·복귀·타이머 중복 없음, 기존 영상 유지, 도시 메뉴 키보드 조작 |
| 최종 홈·키보드 회귀 | PASS, 75개 확인 | 앱 7초 자동 진행·키보드 포커스 중 7초 정지·빠른 dot 12회 조작 후 폰/문구 일치, JS 차단 시 인증 제출 비활성화 포함 |

Auth 브라우저 검수에서 콘솔 오류·미처리 예외·내부 HTTP 오류·실패한 요청은 모두 0건입니다. 상세 검수에서도 콘솔 오류·경고·HTTP 실패는 0건이며, 최종 홈·키보드 회귀도 오류 0건입니다. 자동 계측은 육안 대조나 실기기 테스트를 대신하지 않습니다. 대비·모바일 검색 글자 크기의 마지막 보완 후 동일한 36화면을 다시 검사하여 모두 통과했습니다. 360·768·1440px 인증/Guide 캡처와 360·768·1280px 상세 캡처를 육안으로 확인했습니다. 모든 JavaScript의 node --check, HTML 내부 경로와 CSS 에셋 경로 검증, git diff --check도 통과했습니다.

검수 결과 파일: `/tmp/f45_auth_qa.json`, `/tmp/f45-detail-qa-result.json`, `/tmp/f45_layout_qa.json`, `/tmp/f45_final_regression.json`. 이 경로는 작업 환경의 임시 증거이며 저장소에 포함되지 않습니다. Critical FAIL은 없습니다. 최종 Git 결과는 작업 종료 보고와 저장소 기록에서 확인합니다.

## 알려진 제한과 미실행 범위

- 실제 회원 인증·사용자 DB·결제·예약·체험 접수·이메일/SMS 전송은 없습니다.
- 로컬 브라우저 데이터는 변경·삭제 가능하고 다른 기기·브라우저와 동기화되지 않습니다. 저장소나 Web Crypto가 차단된 환경에서는 오류 안내 후 인증을 진행하지 않습니다.
- 지도는 참고 이미지이며 실시간 지점 운영 상태·좌표·길찾기를 보장하지 않습니다. 6개 지점 정보는 승인된 포트폴리오 데이터입니다.
- 목적지가 확인되지 않은 푸터 소셜·정책 항목은 비클릭 안내로 유지합니다. 임의의 외부 URL을 만들지 않습니다.
- 실제 iOS/Android 기기의 키보드·입력 확대·터치 관성, 스크린 리더 음성 출력은 아직 직접 검수하지 않았습니다. Chrome의 viewport·touch·reduced-motion 시뮬레이션과 구분합니다.
- 비활성 탭 처리는 모의 `visibilitychange`로 확인했습니다. 실제 OS에서 브라우저를 백그라운드로 보냈을 때의 타이머·영상 동작까지 검증한 것은 아닙니다.
- 설치된 WebKit 실행 파일이 없어 WebKit/Safari를 검사하지 못했습니다. 외부 앱스토어의 설치·결제 흐름과 원격 GitHub Pages 작업 브랜치 배포도 실행하지 않았습니다.

## Preview와 종료 절차

- 홈: `http://localhost:8000/`
- 로그인: `http://localhost:8000/pages/login.html`
- 회원가입: `http://localhost:8000/pages/signup.html`
- 상세 예: `http://localhost:8000/pages/detail.html?branch=gyodae`

최종 QA와 `git diff --check` 후 단일 커밋 `feat: complete F45 auth branch detail and interactions`를 만들고 `feature/f45-final-completion`만 push합니다. main 병합과 Pull Request 생성은 범위에 없습니다. 최종 SHA·push·작업 트리 상태는 완료 시점에 보고합니다.

## 이전 구현 이력 — 현재 상태와 구분

아래는 2026년 7~8월 작업의 배경 요약입니다. 당시의 검수 제한이나 미구현 설명을 현재 요구사항으로 사용하지 않습니다. 상세 변경 이력은 Git 기록에서 확인합니다.

- 2026-07-30: Figma PC 화면을 바탕으로 로고·Hero·WHY와 로컬 폰트·색상 토큰을 구현했습니다. 과거 동영상 변환·poster 실험은 현재 연결된 에셋 상태와 구분합니다.
- 2026-08-06~09: 지점 찾기·앱 화면을 Figma 컴포넌트와 대조하고, 앱은 사용자가 되돌린 GSAP 갤러리 대신 CSS 전환으로 확정했습니다. 헤더 앵커와 실제 앱스토어 링크를 연결했습니다.
- 2026-08-08: 초기 로그인·체험 안내 모달을 만들었습니다. 2026-09-20에는 로그인 모달을 로그인 페이지로 대체하고 체험 모달 접근성을 보완했습니다.
- 2026-08-22: WHY AOS와 네이티브 스크롤 기반 Hero 효과를 도입했습니다. ScrollTrigger는 앵커 위치 충돌 때문에 제거했던 이력이 있어 현재도 사용하지 않습니다.
- 2026-08-23: Leaflet/지도와 PHASE 모션 실험이 있었습니다. 현재 페이지는 참고 지도 이미지를 사용하고 PHASE 휠·드래그 동작을 유지합니다.
- 2026-08-30: 모바일 Figma 구성, Hero 이미지 5장·dots, 모바일 Guide 및 PHASE 스크롤을 조정했습니다. 별도로 생성·크롭한 이미지 관련 과거 기록은 현재 HTML이 실제로 참조하는 에셋 목록과 같다고 가정하지 않습니다.
- 2026-09-20: 이번 Final Completion에서 Auth·Detail·메뉴·인터랙션·반응형을 구현하고 실제 브라우저 검증을 진행했습니다. 과거의 ‘향후 로그인/상세 구현’, ‘검색 빈 상태 없음’, ‘localStorage 미사용’, ‘태블릿 범위 제외’ 기록은 이 문서의 현재 구현으로 대체합니다.
