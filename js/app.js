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
        toggle.focus();
      });
    });

    document.addEventListener("click", function (event) {
      if (!dropdown.contains(event.target)) {
        closeDropdown();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && dropdown.classList.contains("is_open")) {
        closeDropdown();
        toggle.focus();
      }
    });
    dropdown.addEventListener("keydown", function handleCityKeydown(event) {
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      openDropdown();
      var index = Array.from(items).indexOf(document.activeElement);
      if (event.key === "Home") index = 0;
      else if (event.key === "End") index = items.length - 1;
      else if (index < 0) index = event.key === "ArrowDown" ? 0 : items.length - 1;
      else index = (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
      items[index].focus();
    });
    dropdown.addEventListener("focusout", function handleCityFocusout(event) {
      if (!dropdown.contains(event.relatedTarget)) closeDropdown();
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

    var visibleCount = 0;
    branchItems.forEach(function (branchItem) {
      var matchesCity = city === "전체" || branchItem.dataset.city === city;
      var matchesKeyword =
        keyword === "" ||
        branchItem.dataset.name.indexOf(keyword) !== -1 ||
        branchItem.dataset.address.indexOf(keyword) !== -1;

      var isVisible = matchesCity && matchesKeyword;
      branchItem.classList.toggle("is_hidden", !isVisible);
      if (isVisible) visibleCount += 1;
    });
    var emptyState = document.getElementById("branch_empty");
    if (emptyState) emptyState.hidden = visibleCount !== 0;
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

    // 모바일 디자인에서는 별도 검색 버튼이 노출되지 않으므로 키보드의 검색/Enter로도
    // 동일한 필터가 확실히 실행되게 한다. 데스크톱에서는 기존 검색 버튼과 함께 동작한다.
    input.addEventListener("keydown", function (event) {
      if (event.key !== "Enter") {
        return;
      }

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
      var canScroll = event.deltaY > 0 ? track.scrollLeft < track.scrollWidth - track.clientWidth - 1 : track.scrollLeft > 0;
      if (canScroll && Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        track.scrollLeft += event.deltaY;
        event.preventDefault();
      }
    }

    function handlePhasePointerDown(event) {
      if (event.pointerType !== "mouse" || event.button !== 0 || event.target.closest("a, button")) {
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

    track.addEventListener("keydown", function handlePhaseKeydown(event) {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        track.scrollLeft += (event.key === "ArrowRight" ? 1 : -1) * 280;
      }
    });
    track.addEventListener("wheel", handlePhaseWheel, { passive: false });
    track.addEventListener("pointerdown", handlePhasePointerDown);
    track.addEventListener("pointermove", handlePhasePointerMove);
    track.addEventListener("pointerup", handlePhasePointerUp);
    track.addEventListener("pointerleave", handlePhasePointerUp);
  }

  function initTouchSwipe(element, options) {
    var gesture = null;

    function findTouch(touches, identifier) {
      for (var index = 0; index < touches.length; index += 1) {
        if (touches[index].identifier === identifier) return touches[index];
      }
      return null;
    }

    function finishGesture(direction) {
      if (!gesture) return;
      gesture = null;
      options.onEnd(direction || 0);
    }

    function handleTouchStart(event) {
      if (gesture || event.touches.length !== 1) {
        finishGesture(0);
        return;
      }
      if (!options.isEnabled() || event.target.closest("a, button, input, select, textarea, label")) return;

      var touch = event.touches[0];
      // Safari의 화면 가장자리 뒤로/앞으로 가기 제스처는 브라우저에 맡긴다.
      if (touch.clientX <= 20 || touch.clientX >= document.documentElement.clientWidth - 20) return;

      gesture = { identifier: touch.identifier, startX: touch.clientX, startY: touch.clientY, isVertical: false };
      options.onStart();
    }

    function handleAdditionalTouch(event) {
      if (event.touches.length !== 1) finishGesture(0);
    }

    function handleTouchMove(event) {
      if (!gesture) return;
      var touch = findTouch(event.touches, gesture.identifier);
      if (event.touches.length !== 1 || !touch) {
        finishGesture(0);
        return;
      }
      var deltaX = Math.abs(touch.clientX - gesture.startX);
      var deltaY = Math.abs(touch.clientY - gesture.startY);
      // 세로 스크롤로 시작한 동작은 끝에서 가로로 흔들려도 슬라이드를 넘기지 않는다.
      if (deltaY >= 10 && deltaY > deltaX) gesture.isVertical = true;
    }

    function handleTouchEnd(event) {
      if (!gesture) return;
      var touch = findTouch(event.changedTouches, gesture.identifier);
      if (!touch) return;
      var deltaX = touch.clientX - gesture.startX;
      var deltaY = touch.clientY - gesture.startY;
      var canSwipe = options.isEnabled() && event.touches.length === 0 && !gesture.isVertical && Math.abs(deltaX) >= 40 && Math.abs(deltaX) > Math.abs(deltaY);
      finishGesture(canSwipe ? (deltaX < 0 ? 1 : -1) : 0);
    }

    function handleGestureCancel() {
      finishGesture(0);
    }

    // preventDefault 없이 세로 스크롤·핀치를 허용하며 Touch Events만 사용해 중복 전환을 막는다.
    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchstart", handleAdditionalTouch, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
    document.addEventListener("touchcancel", handleGestureCancel, { passive: true });
    document.addEventListener("visibilitychange", handleGestureCancel);
    window.addEventListener("resize", handleGestureCancel);
    window.addEventListener("orientationchange", handleGestureCancel);
    window.addEventListener("pagehide", handleGestureCancel);
  }

  function initHeroMedia() {
    var hero = document.getElementById("hero");
    var heroVideo = document.querySelector(".hero_video");
    var images = document.querySelectorAll(".hero_image");
    var dots = document.querySelectorAll(".hero_dot");

    if (!hero || images.length < 2 || images.length !== dots.length) {
      return;
    }

    var currentIndex = 0;
    var autoplayId = null;
    var autoplayDelayMs = 5000;
    var mobileMediaQuery = window.matchMedia("(max-width: 767px)");
    var reducedMotionMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    var heroVideoSource = heroVideo ? heroVideo.dataset.src : "";
    var isHeroInView = true;
    var isTouchActive = false;
    var isMouseOver = false;

    function showSlide(index) {
      currentIndex = (index + images.length) % images.length;

      images.forEach(function (image, imageIndex) {
        image.classList.toggle("is_active", imageIndex === currentIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        var isActive = dotIndex === currentIndex;
        dot.classList.toggle("is_active", isActive);
        dot.setAttribute("aria-selected", isActive ? "true" : "false");
        dot.tabIndex = isActive ? 0 : -1;
      });
    }

    function stopAutoplay() {
      if (autoplayId !== null) {
        window.clearInterval(autoplayId);
        autoplayId = null;
      }
    }

    function startAutoplay() {
      if (!mobileMediaQuery.matches || reducedMotionMediaQuery.matches || autoplayId !== null || !isHeroInView || document.hidden || isTouchActive || isMouseOver || hero.contains(document.activeElement)) {
        return;
      }

      autoplayId = window.setInterval(function () {
        showSlide(currentIndex + 1);
      }, autoplayDelayMs);
    }

    function unloadHeroVideo() {
      if (!heroVideo) {
        return;
      }

      heroVideo.pause();

      if (heroVideo.hasAttribute("src")) {
        heroVideo.removeAttribute("src");
        heroVideo.load();
      }
    }

    function loadHeroVideo() {
      if (!heroVideo || !heroVideoSource) {
        return false;
      }

      if (!heroVideo.hasAttribute("src")) {
        heroVideo.setAttribute("src", heroVideoSource);
        heroVideo.load();
      }

      return true;
    }

    function syncHeroMedia() {
      stopAutoplay();

      if (mobileMediaQuery.matches) {
        unloadHeroVideo();
        startAutoplay();
        return;
      }

      if (!loadHeroVideo()) {
        unloadHeroVideo();
        return;
      }

      if (reducedMotionMediaQuery.matches || !isHeroInView || document.hidden) {
        heroVideo.pause();
        return;
      }

      var playPromise = heroVideo.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    function bindMediaChange(mediaQuery) {
      if (typeof mediaQuery.addEventListener === "function") {
        mediaQuery.addEventListener("change", syncHeroMedia);
      } else if (typeof mediaQuery.addListener === "function") {
        mediaQuery.addListener(syncHeroMedia);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.dataset.index));
        stopAutoplay();
        startAutoplay();
      });
    });

    initTouchSwipe(hero, {
      isEnabled: function () { return mobileMediaQuery.matches; },
      onStart: function () {
        isTouchActive = true;
        stopAutoplay();
      },
      onEnd: function (direction) {
        isTouchActive = false;
        if (direction) showSlide(currentIndex + direction);
        startAutoplay();
      }
    });

    hero.addEventListener("pointerenter", function handleHeroPointerEnter(event) {
      if (event.pointerType !== "mouse") return;
      isMouseOver = true;
      stopAutoplay();
    });
    hero.addEventListener("pointerleave", function handleHeroPointerLeave(event) {
      if (event.pointerType !== "mouse") return;
      isMouseOver = false;
      startAutoplay();
    });
    hero.addEventListener("focusin", stopAutoplay);
    hero.addEventListener("focusout", function (event) {
      if (!hero.contains(event.relatedTarget)) {
        startAutoplay();
      }
    });

    document.addEventListener("visibilitychange", syncHeroMedia);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function handleHeroVisibility(entries) {
        isHeroInView = entries[0].isIntersecting;
        syncHeroMedia();
      }).observe(hero);
    }
    bindMediaChange(mobileMediaQuery);
    bindMediaChange(reducedMotionMediaQuery);
    syncHeroMedia();
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
      { title: "상단 크레딧 구매에서\n체험권 구매", desc: "크레딧 결제까지 순식간에 끝나요", button: "none" },
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
    // 왼쪽 폰 크로스페이드(css transition 0.9s, style.css .trial_phone_slide)와 같은
    // 순간(t=0)에 시작해서 같은 길이(0.9s)로 끝나도록 맞춤 — out 0.15s(css
    // .is_sliding_out_*)로 짧게 빠지고, 남은 0.75s를 "들어오는" 쪽에 몰아서 폰이
    // 서서히 나타나는 동안 텍스트도 같이 서서히 자리 잡도록 함(css .trial_right 참고).
    var textOutMs = 150;
    var autoplayId = null;
    var autoplayDelayMs = 7000; // "정말 천천히" 요청에 맞춘 자동 전환 간격
    var reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    var isReducedMotion = reducedMotionQuery.matches;
    var textTimeoutId = null;
    var isInView = false;
    var isTouchActive = false;
    var isMouseOver = false;

    // 자체 트랜지션이 있어서 즉시 실행해도 되는 것들(폰 크로스페이드, dot 모프)
    function applyPhoneAndDots(index) {
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is_active", slideIndex === index);
        slide.setAttribute("aria-hidden", slideIndex === index ? "false" : "true");
      });

      dots.forEach(function (dot, dotIndex) {
        var isActive = dotIndex === index;
        dot.classList.toggle("is_active", isActive);
        dot.setAttribute("aria-selected", isActive ? "true" : "false");
        dot.tabIndex = isActive ? 0 : -1;
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
      if (textTimeoutId !== null) window.clearTimeout(textTimeoutId);
      trialRight.classList.remove("is_sliding_out_left", "is_sliding_out_right", "is_sliding_in_left", "is_sliding_in_right");
      currentIndex = index;

      if (isReducedMotion) {
        applyStepContent(index);
        return;
      }

      var outClass = direction < 0 ? "is_sliding_out_right" : "is_sliding_out_left";
      var inClass = direction < 0 ? "is_sliding_in_left" : "is_sliding_in_right";

      // 폰 크로스페이드·dot 전환은 텍스트가 빠져나가기 시작하는 시점(t=0)에 함께 시작 —
      // 이렇게 해야 왼쪽/오른쪽이 같은 순간에 움직이기 시작함. 문구·버튼 "내용"만
      // 화면 밖으로 다 빠진 뒤(textOutMs 후)에 바꿔치기 가능하므로 그것만 지연시킴.
      applyPhoneAndDots(index);
      trialRight.classList.add(outClass);

      textTimeoutId = window.setTimeout(function () {
        textTimeoutId = null;
        applyTextContent(currentIndex);
        trialRight.classList.remove(outClass);
        trialRight.classList.add(inClass);

        // 다음 프레임에 in 클래스를 떼야 "제자리로 슬라이드 인"하는 트랜지션이 실제로 재생됨
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            trialRight.classList.remove(inClass);
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
      if (isReducedMotion || autoplayId !== null || !isInView || document.hidden || isTouchActive || isMouseOver || trialInner.contains(document.activeElement)) {
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

    initTouchSwipe(trialInner, {
      isEnabled: function () { return true; },
      onStart: function () {
        isTouchActive = true;
        stopAutoplay();
      },
      onEnd: function (direction) {
        isTouchActive = false;
        if (direction) handleManualNavigate(currentIndex + direction, direction);
        else startAutoplay();
      }
    });

    trialInner.addEventListener("pointerenter", function handleTrialPointerEnter(event) {
      if (event.pointerType !== "mouse") return;
      isMouseOver = true;
      stopAutoplay();
    });
    trialInner.addEventListener("pointerleave", function handleTrialPointerLeave(event) {
      if (event.pointerType !== "mouse") return;
      isMouseOver = false;
      startAutoplay();
    });
    trialInner.addEventListener("focusin", stopAutoplay);
    trialInner.addEventListener("focusout", function handleTrialFocusout(event) {
      if (!trialInner.contains(event.relatedTarget)) startAutoplay();
    });
    reducedMotionQuery.addEventListener("change", function handleTrialMotionChange() {
      isReducedMotion = reducedMotionQuery.matches;
      stopAutoplay();
      if (textTimeoutId !== null) window.clearTimeout(textTimeoutId);
      textTimeoutId = null;
      trialRight.classList.remove("is_sliding_out_left", "is_sliding_out_right", "is_sliding_in_left", "is_sliding_in_right");
      applyStepContent(currentIndex);
      startAutoplay();
    });
    document.addEventListener("visibilitychange", function handleTrialVisibility() {
      stopAutoplay(); startAutoplay();
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        isInView = entries[0].isIntersecting;
        stopAutoplay(); startAutoplay();
      }).observe(trialInner);
    } else { isInView = true; }
    applyStepContent(0);
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
    initHeroMedia();
    initTrialCarousel();
    initLogoScrollTop();
    document.querySelectorAll("[role=tablist]").forEach(function (list) {
      list.addEventListener("keydown", function handleIndicatorKeydown(event) {
        var keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
        if (!keys.includes(event.key)) return;
        var tabs = Array.from(list.querySelectorAll("[role=tab]"));
        var current = tabs.indexOf(document.activeElement);
        if (current < 0) return;
        event.preventDefault();
        var next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (current + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
        tabs[next].focus(); tabs[next].click();
      });
    });
  });
})();
