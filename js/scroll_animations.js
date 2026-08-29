(function () {
  "use strict";

  // WHY F45 KOREA 섹션 카드 스크롤 등장 애니메이션 (AOS 라이브러리).
  // AOS의 [data-aos] 기본 CSS는 opacity:0으로 시작하므로, AOS.js가 로드되지 않으면
  // 카드가 영원히 숨겨진 채로 남는다. 이를 막기 위해 로드 실패 시 data-aos 속성을
  // 직접 제거해 콘텐츠를 즉시 보이게 한다.
  function showCardsWithoutAnimation() {
    document.querySelectorAll("[data-aos]").forEach(function (el) {
      el.removeAttribute("data-aos");
    });
  }

  function initAosCardReveal() {
    var hasAos = typeof window.AOS !== "undefined";

    if (!hasAos) {
      showCardsWithoutAnimation();
      return;
    }

    var isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // disable:true로 초기화하면 AOS가 data-aos 속성을 스스로 제거해 애니메이션 없이
    // 즉시 콘텐츠를 보여준다 (모션 감소 선호 사용자 대응).
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      offset: 80,
      disable: isReducedMotion,
    });
  }

  // 히어로 섹션 스크롤 전환.
  // 히어로가 스크롤에 따라 자연스럽게 위로 빠져나가면서 동시에 살짝 축소·페이드아웃되는
  // 효과. 참고로 전달받은 원본 코드는 GSAP ScrollTrigger의 pin(고정)으로 다음 섹션이
  // 그 위를 덮게 만드는 방식이었으나, 실제로 적용해보니 ScrollTrigger가 초기화 시
  // 트리거 위치를 측정(refresh)하면서 스크롤 위치에 관여하는 탓에 이 사이트가 이미
  // 쓰고 있는 #id 앵커 이동(헤더 로고·"지점 찾기"·"체험권" 등)이 섹션에 따라 제자리에
  // 멈추거나 엉뚱한 섹션으로 넘어가는 문제가 반복 재현됨(pin 제거, 초기화 시점을
  // window load로 미루는 두 가지 시도 모두 완전히 해결하지 못함). ScrollTrigger 플러그인
  // 자체를 쓰지 않고 순수 scroll 이벤트 + GSAP core(gsap.set)만으로 같은 시각 효과를
  // 재현해 이 문제를 근본적으로 피함 — 스크롤 위치를 읽기만 하고 절대 쓰지 않으므로
  // 앵커 이동과 충돌할 수 없음.
  function initHeroScrollTransition() {
    var hero = document.getElementById("hero");
    var hasGsap = typeof window.gsap !== "undefined";
    var isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var isMobile = window.matchMedia("(max-width: 767px)").matches;

    if (!hero || !hasGsap || isReducedMotion || isMobile) {
      return;
    }

    var heroHeight = hero.offsetHeight;

    // transformOrigin을 하단 중앙으로 둬서 확대될 때 아래쪽(다음 섹션과 맞닿는 경계)은
    // 고정되고 위쪽으로만 커지게 함 — 반대로 중앙 기준이면 확대분만큼 아래로도 자라나
    // 이미 스크롤로 올라와 있는 다음 섹션(#story) 위를 불필요하게 더 덮게 됨.
    gsap.set(hero, { transformOrigin: "50% 100%" });

    function updateHeroTransform() {
      var progress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
      gsap.set(hero, {
        scale: 1 + progress * 0.15,
        opacity: 1 - progress * 0.75,
      });
    }

    function handleResize() {
      heroHeight = hero.offsetHeight;
      updateHeroTransform();
    }

    window.addEventListener("scroll", updateHeroTransform, { passive: true });
    window.addEventListener("resize", handleResize);
    updateHeroTransform();
  }

  function initGuideCardReveal() {
    var cards = document.querySelectorAll(".guide_card_pin");
    var isMobile = window.matchMedia("(max-width: 767px)").matches;
    var isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var hasObserver = "IntersectionObserver" in window;

    if (cards.length === 0 || !isMobile || isReducedMotion || !hasObserver) {
      return;
    }

    document.documentElement.classList.add("has_guide_reveal");

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is_visible");
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.1,
      // 화면 상단 40% 영역에 카드가 들어왔을 때만 노출해, 큰 모바일 화면에서도
      // 두 장이 동시에 감지되지 않고 스크롤 순서대로 한 장씩 나타나게 한다.
      rootMargin: "0px 0px -57% 0px",
    });

    cards.forEach(function (card) {
      observer.observe(card);
    });

    requestAnimationFrame(function () {
      document.documentElement.classList.add("is_guide_reveal_ready");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initAosCardReveal();
    initHeroScrollTransition();
    initGuideCardReveal();
  });
})();
