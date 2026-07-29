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

  function initAppCarousel() {
    var image = document.getElementById("carousel_image");
    var currentLabel = document.getElementById("carousel_current");
    var dots = document.querySelectorAll(".carousel_dot");
    var prevBtn = document.getElementById("carousel_prev");
    var nextBtn = document.getElementById("carousel_next");

    if (!image || !currentLabel || dots.length === 0) {
      return;
    }

    var totalSlides = dots.length;
    var currentIndex = 0;

    function renderSlide() {
      var slideNumber = currentIndex + 1;
      var paddedNumber = slideNumber < 10 ? "0" + slideNumber : String(slideNumber);

      image.src = "./assets/imges/phone" + paddedNumber + ".png";
      image.alt = "F45 앱 화면 " + slideNumber;
      currentLabel.textContent = paddedNumber;

      dots.forEach(function (dot, index) {
        dot.classList.toggle("is_active", index === currentIndex);
      });
    }

    function goToSlide(index) {
      currentIndex = (index + totalSlides) % totalSlides;
      renderSlide();
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        goToSlide(currentIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        goToSlide(currentIndex + 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        goToSlide(Number(dot.dataset.index));
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initCityDropdown();
    initLocatorSearch();
    initAppCarousel();
  });
})();
