(function () {
  "use strict";

  function initCityDropdown() {
    var dropdown = document.getElementById("city_dropdown");
    var toggle = document.getElementById("city_dropdown_toggle");
    var label = document.getElementById("city_dropdown_label");
    var items = document.querySelectorAll(".city_dropdown_item");

    if (!dropdown || !toggle || !label || items.length === 0) {
      return;
    }

    function closeDropdown() {
      dropdown.classList.remove("is_open");
      toggle.setAttribute("aria-expanded", "false");
    }

    function openDropdown() {
      dropdown.classList.add("is_open");
      toggle.setAttribute("aria-expanded", "true");
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
        label.textContent = "도시 선택 · " + item.dataset.city;
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

    function handleInputChange() {
      searchBtn.disabled = input.value.trim() === "";
    }

    input.addEventListener("input", handleInputChange);
    handleInputChange();

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      applyBranchFilter(getSelectedCity());
    });

    if (nearbyBtn) {
      nearbyBtn.addEventListener("click", function () {
        input.value = "";
        handleInputChange();

        var items = document.querySelectorAll(".city_dropdown_item");
        items.forEach(function (item) {
          item.classList.toggle("is_selected", item.dataset.city === "전체");
        });
        var label = document.getElementById("city_dropdown_label");
        if (label) {
          label.textContent = "도시 선택 · 전체";
        }

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
    var phoneImg = document.getElementById("trial_phone_img");
    var numCurrent = document.getElementById("trial_num_current");
    var dots = document.querySelectorAll(".trial_dot");
    var prevBtn = document.getElementById("trial_arrow_left");
    var nextBtn = document.getElementById("trial_arrow_right");

    if (!phoneImg || !numCurrent || dots.length === 0 || !prevBtn || !nextBtn) {
      return;
    }

    var totalSlides = dots.length;
    var currentIndex = 0;

    function renderSlide(index) {
      currentIndex = index;
      var slideNumber = String(index + 1).padStart(2, "0");

      phoneImg.src = "./assets/images/phone" + slideNumber + ".png";
      phoneImg.alt = "F45 앱 실행 화면 " + (index + 1);
      numCurrent.textContent = slideNumber;

      dots.forEach(function (dot, dotIndex) {
        var isActive = dotIndex === index;
        dot.classList.toggle("is_active", isActive);
        dot.setAttribute("aria-selected", isActive ? "true" : "false");
      });
    }

    function goToSlide(index) {
      renderSlide((index + totalSlides) % totalSlides);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        goToSlide(Number(dot.dataset.index));
      });
    });

    prevBtn.addEventListener("click", function () {
      goToSlide(currentIndex - 1);
    });

    nextBtn.addEventListener("click", function () {
      goToSlide(currentIndex + 1);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initCityDropdown();
    initLocatorSearch();
    initPhaseManualScroll();
    initTrialCarousel();
  });
})();
