(function () {
  "use strict";

  // React Bits의 BlurText/FadeContent, SpotlightCard/GlareHover, Magnet에서
  // 등장 순서·포인터 조명·작은 반응 원리만 참고한 Vanilla 구현이다.
  // 기존 GSAP Core 3.12.5만 사용하며 DOM 분할 라이브러리나 플러그인은 없다.
  function initInteractions() {
    if (!window.gsap) {
      return;
    }

    var gsap = window.gsap;
    var reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    var revealTargets = Array.from(document.querySelectorAll("[data-reveal], [data-media-entrance]"))
      .filter(function (target) { return !target.closest("[data-aos]"); });
    var heroLines = Array.from(document.querySelectorAll(".hero_title_line"));
    var completedTargets = new WeakSet();
    var activeTweens = new Map();
    var revealObserver = null;

    function clearMotion(target) {
      var tween = activeTweens.get(target);
      if (tween) {
        tween.kill();
        activeTweens.delete(target);
      }
      gsap.set(target, { clearProps: "opacity,transform" });
    }

    function revealOnce(target, delay) {
      if (completedTargets.has(target)) {
        return;
      }
      completedTargets.add(target);

      if (reducedMotionQuery.matches) {
        return;
      }

      var isMedia = target.hasAttribute("data-media-entrance");
      var isHeroLine = target.classList.contains("hero_title_line");

      // Offscreen content remains readable. Apply the hidden state only in the
      // same task that starts its finite tween; CSS never hides these targets.
      gsap.set(target, {
        opacity: 0,
        y: isHeroLine ? 28 : (isMedia ? 16 : 22),
        scale: isMedia ? 1.03 : 1,
      });
      var tween = gsap.to(target, {
        opacity: 1, y: 0, scale: 1,
        duration: isHeroLine || isMedia ? 0.7 : 0.6,
        delay: delay || 0,
        ease: "power3.out",
        overwrite: "auto",
        onComplete: function () {
          activeTweens.delete(target);
          gsap.set(target, { clearProps: "opacity,transform" });
        },
      });
      activeTweens.set(target, tween);
    }

    function stopReveals() {
      if (revealObserver) {
        revealObserver.disconnect();
        revealObserver = null;
      }
      revealTargets.concat(heroLines).forEach(function (target) {
        completedTargets.add(target);
        clearMotion(target);
      });
    }

    function handleMotionPreferenceChange() {
      if (reducedMotionQuery.matches) {
        stopReveals();
      }
      // Already-shown content stays visible if the preference changes back.
    }

    if (reducedMotionQuery.matches) {
      stopReveals();
    } else {
      heroLines.forEach(function (line, index) { revealOnce(line, index * 0.12); });
      if ("IntersectionObserver" in window) {
        revealObserver = new IntersectionObserver(function (entries) {
          if (!revealObserver) {
            return;
          }
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              revealOnce(entry.target);
              revealObserver.unobserve(entry.target);
            }
          });
        }, { threshold: 0.12 });
        revealTargets.forEach(function (target) { revealObserver.observe(target); });
      }
    }

    if (typeof reducedMotionQuery.addEventListener === "function") {
      reducedMotionQuery.addEventListener("change", handleMotionPreferenceChange);
    } else {
      reducedMotionQuery.addListener(handleMotionPreferenceChange);
    }

    var pointerMedia = gsap.matchMedia();
    pointerMedia.add(
      "(min-width: 1024px) and (pointer: fine) and (hover: hover) and (prefers-reduced-motion: no-preference)",
      function () {
        var cleanups = [];
        var geometryResets = [];

        function bindEvent(element, name, handler) {
          element.addEventListener(name, handler, { passive: true });
          cleanups.push(function () { element.removeEventListener(name, handler); });
        }

        document.querySelectorAll("[data-spotlight]").forEach(function (card) {
          var bounds = null;
          var frameId = 0;
          var pointerX = 0;
          var pointerY = 0;

          function updateSpotlight() {
            frameId = 0;
            card.style.setProperty("--spotlight_x", pointerX + "px");
            card.style.setProperty("--spotlight_y", pointerY + "px");
          }

          function handlePointerMove(event) {
            if (event.pointerType === "touch" || event.buttons !== 0) {
              handlePointerLeave();
              return;
            }
            if (!bounds) {
              bounds = card.getBoundingClientRect();
            }
            pointerX = event.clientX - bounds.left;
            pointerY = event.clientY - bounds.top;
            card.classList.add("is_spotlight_active");
            if (!frameId) {
              frameId = window.requestAnimationFrame(updateSpotlight);
            }
          }

          function handlePointerLeave() {
            card.classList.remove("is_spotlight_active");
            bounds = null;
            if (frameId) {
              window.cancelAnimationFrame(frameId);
              frameId = 0;
            }
          }

          bindEvent(card, "pointerenter", handlePointerMove);
          bindEvent(card, "pointermove", handlePointerMove);
          bindEvent(card, "pointerleave", handlePointerLeave);
          bindEvent(card, "pointercancel", handlePointerLeave);
          geometryResets.push(function () { bounds = null; });
          cleanups.push(function () {
            handlePointerLeave();
            card.style.removeProperty("--spotlight_x");
            card.style.removeProperty("--spotlight_y");
          });
        });

        document.querySelectorAll("[data-magnetic]").forEach(function (button) {
          var label = button.querySelector(".magnetic_label");
          if (!label) {
            return;
          }

          var bounds = null;
          var frameId = 0;
          var pointerX = 0;
          var pointerY = 0;
          var moveX = gsap.quickTo(label, "x", { duration: 0.25, ease: "power2.out" });
          var moveY = gsap.quickTo(label, "y", { duration: 0.25, ease: "power2.out" });

          function updateMagnet() {
            frameId = 0;
            moveX(pointerX);
            moveY(pointerY);
          }

          function resetMagnet(shouldResetImmediately) {
            if (frameId) {
              window.cancelAnimationFrame(frameId);
              frameId = 0;
            }
            bounds = null;
            moveX(0);
            moveY(0);
            if (shouldResetImmediately) {
              moveX.tween.progress(1);
              moveY.tween.progress(1);
              gsap.set(label, { clearProps: "transform" });
            }
          }

          function handlePointerMove(event) {
            if (event.pointerType === "touch" || button.disabled || button.contains(document.activeElement)) {
              resetMagnet(true);
              return;
            }
            if (!bounds) {
              bounds = button.getBoundingClientRect();
            }
            pointerX = Math.max(-6, Math.min(6, ((event.clientX - bounds.left) / bounds.width - 0.5) * 12));
            pointerY = Math.max(-6, Math.min(6, ((event.clientY - bounds.top) / bounds.height - 0.5) * 12));
            if (!frameId) {
              frameId = window.requestAnimationFrame(updateMagnet);
            }
          }

          function handlePointerLeave() { resetMagnet(false); }
          function handleFocusIn() { resetMagnet(true); }

          bindEvent(button, "pointerenter", handlePointerMove);
          bindEvent(button, "pointermove", handlePointerMove);
          bindEvent(button, "pointerleave", handlePointerLeave);
          bindEvent(button, "pointercancel", handlePointerLeave);
          bindEvent(button, "focusin", handleFocusIn);
          geometryResets.push(function () { bounds = null; });
          cleanups.push(function () {
            if (frameId) {
              window.cancelAnimationFrame(frameId);
            }
            moveX.tween.kill();
            moveY.tween.kill();
            gsap.set(label, { clearProps: "transform" });
          });
        });

        function handleGeometryChange() {
          geometryResets.forEach(function (reset) { reset(); });
        }

        // Capture PHASE's inner scroll too; pointermove remeasures only when
        // cached geometry was invalidated, and never prevents drag or click.
        window.addEventListener("scroll", handleGeometryChange, { capture: true, passive: true });
        window.addEventListener("resize", handleGeometryChange, { passive: true });

        return function () {
          cleanups.forEach(function (cleanup) { cleanup(); });
          window.removeEventListener("scroll", handleGeometryChange, true);
          window.removeEventListener("resize", handleGeometryChange);
        };
      }
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initInteractions, { once: true });
  } else {
    initInteractions();
  }
})();
