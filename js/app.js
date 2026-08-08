(function () {
  "use strict";

  function initCityDropdown() {
    var dropdown = document.getElementById("city_dropdown");
    var toggle = document.getElementById("city_dropdown_toggle");
    var label = document.getElementById("city_dropdown_label");
    var icon = document.getElementById("city_dropdown_icon");
    var items = document.querySelectorAll(".city_dropdown_item");

    if (!dropdown || !toggle || !label || !icon || items.length === 0) {
      return;
    }

    // Figma(node 755:640): 닫힘 상태(city_close) = 아래쪽 화살표, 열림 상태(city) = 위쪽 화살표
    function closeDropdown() {
      dropdown.classList.remove("is_open");
      toggle.setAttribute("aria-expanded", "false");
      icon.src = "./assets/icons/down.png";
    }

    function openDropdown() {
      dropdown.classList.add("is_open");
      toggle.setAttribute("aria-expanded", "true");
      icon.src = "./assets/icons/up.png";
    }

    toggle.addEventListener("click", function () {
      var isOpen = dropdown.classList.contains("is_open");
      if (isOpen) {
        closeDropdown();
      } else {
        openDropdown();
      }
    });

    items.forEach(function (item) {
      item.addEventListener("click", function () {
        items.forEach(function (other) {
          other.classList.remove("is_selected");
        });
        item.classList.add("is_selected");
        // Figma 버튼 라벨은 선택 상태와 무관하게 "도시 선택" 고정 문구(width 146px 고정) —
        // 선택된 도시는 목록 안의 강조 항목으로 보여줌
        closeDropdown();
        applyBranchFilter(item.dataset.city);
      });
    });

    document.addEventListener("click", function (event) {
      if (!dropdown.contains(event.target)) {
        closeDropdown();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeDropdown();
      }
    });
  }

  function getSelectedCity() {
    var selected = document.querySelector(".city_dropdown_item.is_selected");
    return selected ? selected.dataset.city : "전체";
  }

  function applyBranchFilter(city) {
    var searchInput = document.getElementById("locator_search_input");
    var keyword = searchInput ? searchInput.value.trim() : "";
    var branchItems = document.querySelectorAll(".branch_item");

    branchItems.forEach(function (branchItem) {
      var matchesCity = city === "전체" || branchItem.dataset.city === city;
      var matchesKeyword =
        keyword === "" ||
        branchItem.dataset.name.indexOf(keyword) !== -1 ||
        branchItem.dataset.address.indexOf(keyword) !== -1;

      branchItem.classList.toggle("is_hidden", !(matchesCity && matchesKeyword));
    });
  }

  function initLocatorSearch() {
    var form = document.getElementById("locator_search_form");
    var input = document.getElementById("locator_search_input");
    var searchBtn = document.getElementById("locator_search_btn");
    var nearbyBtn = document.getElementById("locator_nearby_btn");

    if (!form || !input || !searchBtn) {
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      applyBranchFilter(getSelectedCity());
    });

    if (nearbyBtn) {
      nearbyBtn.addEventListener("click", function () {
        input.value = "";

        var items = document.querySelectorAll(".city_dropdown_item");
        items.forEach(function (item) {
          item.classList.toggle("is_selected", item.dataset.city === "전체");
        });

        applyBranchFilter("전체");
      });
    }
  }

  function initPhaseManualScroll() {
    var track = document.querySelector(".phase_grid");

    if (!track) {
      return;
    }

    var isDragging = false;
    var dragStartX = 0;
    var dragStartScrollLeft = 0;

    function handlePhaseWheel(event) {
      if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        track.scrollLeft += event.deltaY;
        event.preventDefault();
      }
    }

    function handlePhasePointerDown(event) {
      if (event.pointerType !== "mouse") {
        return;
      }
      isDragging = true;
      dragStartX = event.clientX;
      dragStartScrollLeft = track.scrollLeft;
      track.classList.add("is_dragging");
      event.preventDefault();
    }

    function handlePhasePointerMove(event) {
      if (!isDragging) {
        return;
      }
      track.scrollLeft = dragStartScrollLeft - (event.clientX - dragStartX);
    }

    function handlePhasePointerUp() {
      isDragging = false;
      track.classList.remove("is_dragging");
    }

    track.addEventListener("wheel", handlePhaseWheel, { passive: false });
    track.addEventListener("pointerdown", handlePhasePointerDown);
    track.addEventListener("pointermove", handlePhasePointerMove);
    track.addEventListener("pointerup", handlePhasePointerUp);
    track.addEventListener("pointerleave", handlePhasePointerUp);
  }

  function initTrialCarousel() {
    var trialInner = document.querySelector(".trial_inner");
    var trialRight = document.getElementById("trial_right");
    var slides = document.querySelectorAll(".trial_phone_slide");
    var numCurrent = document.getElementById("trial_num_current");
    var titleEl = document.getElementById("trial_txt_title");
    var descEl = document.getElementById("trial_txt_desc");
    var storeButtons = document.getElementById("trial_store_buttons");
    var ctaBtn = document.getElementById("trial_cta");
    var dots = document.querySelectorAll(".trial_dot");
    var prevBtn = document.getElementById("trial_arrow_left");
    var nextBtn = document.getElementById("trial_arrow_right");

    // Figma 컴포넌트 라이브러리(node 704:426, "trial" step=1~6 variant)를 직접 열어
    // 대조 확인한 값 — 6단계 모두 문구가 다르고, 버튼도 단계별로 다름:
    // step=1만 App/Play Store 버튼, step=6만 "체험권 신청하기" CTA, step=2~5는 버튼 없음.
    var steps = [
      { title: "F45 - Korea (new) 모바일 앱 설치", desc: "설치는 1분이면 충분해요", button: "store" },
      { title: "수강을 원하는 지점 검색", desc: "우리 동네 F45가 바로 나와요", button: "none" },
      { title: "회원가입 또는 로그인", desc: "쉽고 간편한 로그인과 회원가입으로 빠르게 시작해요", button: "none" },
      { title: "하단에 멤버십 탭 클릭", desc: "하단 탭 하나면 충분해요", button: "none" },
      { title: "상단 크레딧 구매에서 체험권 구매", desc: "크레딧 결제까지 순식간에 끝나요", button: "none" },
      { title: "예약하기 버튼 클릭", desc: "이제 F45에서 만나요", button: "cta" }
    ];

    if (
      !trialInner ||
      !trialRight ||
      slides.length === 0 ||
      !numCurrent ||
      !titleEl ||
      !descEl ||
      !storeButtons ||
      !ctaBtn ||
      dots.length === 0 ||
      !prevBtn ||
      !nextBtn
    ) {
      return;
    }

    var totalSlides = slides.length;
    var currentIndex = 0;
    var isAnimatingText = false;
    // 왼쪽 폰 크로스페이드(css transition 0.9s, style.css .trial_phone_slide)와 같은
    // 순간(t=0)에 시작해서 같은 길이(0.9s)로 끝나도록 맞춤 — out 0.15s(css
    // .is_sliding_out_*)로 짧게 빠지고, 남은 0.75s를 "들어오는" 쪽에 몰아서 폰이
    // 서서히 나타나는 동안 텍스트도 같이 서서히 자리 잡도록 함(css .trial_right 참고).
    var textOutMs = 150;
    var autoplayId = null;
    var autoplayDelayMs = 7000; // "정말 천천히" 요청에 맞춘 자동 전환 간격
    var isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 자체 트랜지션이 있어서 즉시 실행해도 되는 것들(폰 크로스페이드, dot 모프)
    function applyPhoneAndDots(index) {
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is_active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        var isActive = dotIndex === index;
        dot.classList.toggle("is_active", isActive);
        dot.setAttribute("aria-selected", isActive ? "true" : "false");
      });
    }

    // 화면 밖으로 완전히 빠진 뒤에만 바꿔칠 수 있는 것들(문구·버튼 "내용")
    function applyTextContent(index) {
      var slideNumber = String(index + 1).padStart(2, "0");
      var step = steps[index] || steps[0];

      numCurrent.textContent = slideNumber;
      titleEl.textContent = step.title;
      descEl.textContent = step.desc;
      storeButtons.classList.toggle("is_hidden", step.button !== "store");
      ctaBtn.classList.toggle("is_hidden", step.button !== "cta");
    }

    function applyStepContent(index) {
      applyPhoneAndDots(index);
      applyTextContent(index);
    }

    // direction: 1=다음(왼쪽으로 빠지고 오른쪽에서 들어옴), -1=이전(반대)
    function renderSlide(index, direction) {
      currentIndex = index;

      if (isReducedMotion || isAnimatingText) {
        applyStepContent(index);
        return;
      }

      isAnimatingText = true;
      var outClass = direction < 0 ? "is_sliding_out_right" : "is_sliding_out_left";
      var inClass = direction < 0 ? "is_sliding_in_left" : "is_sliding_in_right";

      // 폰 크로스페이드·dot 전환은 텍스트가 빠져나가기 시작하는 시점(t=0)에 함께 시작 —
      // 이렇게 해야 왼쪽/오른쪽이 같은 순간에 움직이기 시작함. 문구·버튼 "내용"만
      // 화면 밖으로 다 빠진 뒤(textOutMs 후)에 바꿔치기 가능하므로 그것만 지연시킴.
      applyPhoneAndDots(index);
      trialRight.classList.add(outClass);

      window.setTimeout(function () {
        applyTextContent(index);
        trialRight.classList.remove(outClass);
        trialRight.classList.add(inClass);

        // 다음 프레임에 in 클래스를 떼야 "제자리로 슬라이드 인"하는 트랜지션이 실제로 재생됨
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            trialRight.classList.remove(inClass);
            isAnimatingText = false;
          });
        });
      }, textOutMs);
    }

    function goToSlide(index, direction) {
      var nextIndex = (index + totalSlides) % totalSlides;
      var resolvedDirection = direction === undefined ? (nextIndex >= currentIndex ? 1 : -1) : direction;
      renderSlide(nextIndex, resolvedDirection);
    }

    function startAutoplay() {
      if (isReducedMotion || autoplayId !== null) {
        return;
      }
      autoplayId = window.setInterval(function () {
        goToSlide(currentIndex + 1, 1);
      }, autoplayDelayMs);
    }

    function stopAutoplay() {
      if (autoplayId !== null) {
        window.clearInterval(autoplayId);
        autoplayId = null;
      }
    }

    function handleManualNavigate(index, direction) {
      goToSlide(index, direction);
      // 수동 조작 직후 자동 전환이 바로 이어지지 않도록 타이머를 다시 시작
      stopAutoplay();
      startAutoplay();
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        handleManualNavigate(Number(dot.dataset.index));
      });
    });

    prevBtn.addEventListener("click", function () {
      handleManualNavigate(currentIndex - 1, -1);
    });

    nextBtn.addEventListener("click", function () {
      handleManualNavigate(currentIndex + 1, 1);
    });

    trialInner.addEventListener("mouseenter", stopAutoplay);
    trialInner.addEventListener("mouseleave", startAutoplay);

    startAutoplay();
  }

  // 로고는 href="#header"만으로도 대부분 동작하지만, 헤더가 position:sticky라
  // 이미 화면에 계속 보이는 상태라 브라우저가 "이미 보임"으로 판단해 조금만
  // 움직이는 경우가 있었음 — JS로 확실하게 맨 위(scrollY 0)까지 이동시킴
  function initLogoScrollTop() {
    var logo = document.querySelector(".logo");

    if (!logo) {
      return;
    }

    logo.addEventListener("click", function (event) {
      event.preventDefault();
      var isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: isReducedMotion ? "auto" : "smooth" });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initCityDropdown();
    initLocatorSearch();
    initPhaseManualScroll();
    initTrialCarousel();
    initLogoScrollTop();
  });
})();
