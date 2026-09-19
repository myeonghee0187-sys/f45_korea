(function () {
  "use strict";

  // Trial information only: no purchase or reservation is submitted here.
  function initModals() {
    var modal = document.getElementById("trial_modal");
    if (!modal) return;
    var triggerElement = null;
    var inertElements = [];
    var closeButton = modal.querySelector(".modal_close");
    var card = modal.querySelector(".modal_card");
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function closeModal() {
      if (modal.hidden) return;
      if (window.gsap) window.gsap.killTweensOf(card);
      modal.hidden = true;
      document.body.classList.remove("has_modal_open");
      inertElements.forEach(function (element) { element.inert = false; });
      inertElements = [];
      if (triggerElement && triggerElement.isConnected) triggerElement.focus();
    }

    function handleOpenModal(event) {
      event.preventDefault();
      if (window.F45Auth) window.F45Auth.closeMenu();
      triggerElement = event.currentTarget;
      modal.hidden = false;
      document.body.classList.add("has_modal_open");
      inertElements = Array.from(document.body.children).filter(function (element) {
        return element !== modal && !element.inert && !["SCRIPT", "STYLE"].includes(element.tagName);
      });
      inertElements.forEach(function (element) { element.inert = true; });
      if (window.gsap && !reducedMotion.matches && card) {
        window.gsap.fromTo(card, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.3, clearProps: "opacity,transform" });
      }
      if (closeButton) closeButton.focus();
    }

    function handleModalKeydown(event) {
      if (modal.hidden) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
      } else if (event.key === "Tab") {
        var items = Array.from(modal.querySelectorAll("button:not(:disabled), a[href], input:not(:disabled), [tabindex='0']")).filter(function (item) { return item.getClientRects().length > 0; });
        var first = items[0];
        var last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }

    document.querySelectorAll("[data-modal-target='trial_modal'], #hero_cta, #trial_cta").forEach(function (trigger) {
      trigger.addEventListener("click", handleOpenModal);
    });
    if (closeButton) closeButton.addEventListener("click", closeModal);
    modal.addEventListener("click", function handleOverlayClick(event) { if (event.target === modal) closeModal(); });
    document.addEventListener("keydown", handleModalKeydown);
    reducedMotion.addEventListener("change", function handleMotionChange() {
      if (reducedMotion.matches && window.gsap && card) {
        window.gsap.killTweensOf(card);
        window.gsap.set(card, { clearProps: "opacity,transform" });
      }
    });
  }

  document.addEventListener("DOMContentLoaded", initModals);
})();
