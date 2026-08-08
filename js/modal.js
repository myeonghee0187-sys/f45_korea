(function () {
  "use strict";

  // 로그인 / 체험권 신청 안내 모달. GSAP이 로드돼 있으면 부드러운 등장·퇴장
  // 애니메이션을 쓰고, 없거나 사용자가 모션 감소를 선호하면 즉시 열고 닫음.
  function initModals() {
    var modals = document.querySelectorAll(".modal_overlay");

    if (modals.length === 0) {
      return;
    }

    var hasGsap = typeof window.gsap !== "undefined";
    var isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var shouldAnimate = hasGsap && !isReducedMotion;

    function openModal(modal, triggerEl) {
      modal.hidden = false;
      modal.dataset.triggerId = triggerEl && triggerEl.id ? triggerEl.id : "";
      document.body.classList.add("has_modal_open");

      var card = modal.querySelector(".modal_card");
      var closeBtn = modal.querySelector(".modal_close");

      if (shouldAnimate && card) {
        gsap.set(modal, { opacity: 0 });
        gsap.set(card, { opacity: 0, y: 16, scale: 0.96 });
        gsap.to(modal, { opacity: 1, duration: 0.25, ease: "power2.out" });
        gsap.to(card, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "back.out(1.6)" });
      }

      if (closeBtn) {
        closeBtn.focus();
      }
    }

    function closeModal(modal) {
      var card = modal.querySelector(".modal_card");
      var triggerId = modal.dataset.triggerId;

      function finishClose() {
        modal.hidden = true;
        document.body.classList.remove("has_modal_open");

        var trigger = triggerId ? document.getElementById(triggerId) : null;
        if (trigger) {
          trigger.focus();
        }
      }

      if (shouldAnimate && card) {
        gsap.to(card, { opacity: 0, y: 16, scale: 0.96, duration: 0.2, ease: "power1.in" });
        gsap.to(modal, { opacity: 0, duration: 0.2, ease: "power1.in", onComplete: finishClose });
      } else {
        finishClose();
      }
    }

    function isModalOpen(modal) {
      return !modal.hidden;
    }

    modals.forEach(function (modal) {
      var closeBtn = modal.querySelector(".modal_close");

      if (closeBtn) {
        closeBtn.addEventListener("click", function () {
          closeModal(modal);
        });
      }

      // 배경(오버레이) 클릭 시 닫기 — 카드 자체 클릭은 버블링으로 여기까지 안 옴
      modal.addEventListener("click", function (event) {
        if (event.target === modal) {
          closeModal(modal);
        }
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") {
        return;
      }
      modals.forEach(function (modal) {
        if (isModalOpen(modal)) {
          closeModal(modal);
        }
      });
    });

    function bindTrigger(triggerId, modalId) {
      var trigger = document.getElementById(triggerId);
      var modal = document.getElementById(modalId);

      if (!trigger || !modal) {
        return;
      }

      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        openModal(modal, trigger);
      });
    }

    bindTrigger("login_trigger", "login_modal");
    bindTrigger("hero_cta", "trial_modal");
    bindTrigger("trial_cta", "trial_modal");
  }

  document.addEventListener("DOMContentLoaded", initModals);
})();
