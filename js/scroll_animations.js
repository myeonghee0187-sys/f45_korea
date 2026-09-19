(function () {
  "use strict";

  function listenForMediaChange(mediaQuery, handler) {
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handler);
    } else {
      mediaQuery.addListener(handler);
    }
  }

  function showCardsWithoutAnimation() {
    document.documentElement.classList.remove("has_aos_motion");
    document.querySelectorAll("[data-aos]").forEach(function (card) {
      card.removeAttribute("data-aos");
      card.removeAttribute("data-aos-delay");
    });
  }

  function initAosCardReveal() {
    var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!window.AOS || motionQuery.matches) {
      showCardsWithoutAnimation();
      return;
    }

    try {
      // No-JS and CDN-failure CSS keeps AOS content visible until initialization.
      document.documentElement.classList.add("has_aos_motion");
      window.AOS.init({ duration: 700, easing: "ease-out-cubic", once: true, offset: 80 });
    } catch (error) {
      showCardsWithoutAnimation();
      return;
    }

    function handleMotionPreferenceChange() {
      if (motionQuery.matches) {
        // Unseen cards become readable too; AOS is never reinitialized.
        showCardsWithoutAnimation();
      }
    }
    listenForMediaChange(motionQuery, handleMotionPreferenceChange);
  }

  function initHeroScrollTransition() {
    var hero = document.getElementById("hero");
    if (!hero || !window.gsap) {
      return;
    }

    var gsap = window.gsap;
    var heroMedia = gsap.matchMedia();
    heroMedia.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", function () {
      var heroHeight = Math.max(hero.offsetHeight, 1);
      var frameId = 0;
      var lastProgress = -1;

      // Keep the bottom-anchored scale/fade. This only reads native scroll
      // position, so #section anchors retain their native targets.
      gsap.set(hero, { transformOrigin: "50% 100%", scale: 1, opacity: 1 });
      var setScale = gsap.quickSetter(hero, "scale");
      var setOpacity = gsap.quickSetter(hero, "opacity");

      function updateHeroTransform() {
        frameId = 0;
        var progress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
        if (progress !== lastProgress) {
          setScale(1 + progress * 0.15);
          setOpacity(1 - progress * 0.75);
          lastProgress = progress;
        }
      }

      function handleScroll() {
        if (!frameId) {
          frameId = window.requestAnimationFrame(updateHeroTransform);
        }
      }

      function handleResize() {
        heroHeight = Math.max(hero.offsetHeight, 1);
        lastProgress = -1;
        handleScroll();
      }

      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("resize", handleResize, { passive: true });
      updateHeroTransform();

      return function () {
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleResize);
        if (frameId) {
          window.cancelAnimationFrame(frameId);
        }
      };
    });
  }

  function initGuideCardReveal() {
    var cards = document.querySelectorAll(".guide_card_pin");
    if (cards.length === 0 || !("IntersectionObserver" in window)) {
      return;
    }

    var mobileMotionQuery = window.matchMedia("(max-width: 767px) and (prefers-reduced-motion: no-preference)");
    var completedCards = new WeakSet();
    var observer = null;

    function handleMediaChange() {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      cards.forEach(function (card) { card.classList.remove("is_guide_entering"); });

      if (!mobileMotionQuery.matches) {
        return;
      }

      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || completedCards.has(entry.target)) {
            return;
          }
          completedCards.add(entry.target);
          entry.target.classList.add("is_guide_entering");
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.1, rootMargin: "0px 0px -57% 0px" });

      cards.forEach(function (card) {
        if (!completedCards.has(card)) {
          observer.observe(card);
        }
      });
    }

    listenForMediaChange(mobileMotionQuery, handleMediaChange);
    handleMediaChange();
  }

  function initScrollAnimations() {
    initAosCardReveal();
    initHeroScrollTransition();
    initGuideCardReveal();
  }

  document.addEventListener("DOMContentLoaded", initScrollAnimations, { once: true });
})();
