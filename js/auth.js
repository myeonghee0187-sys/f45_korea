(function () {
  "use strict";

  var storage = window.F45Storage;
  var closeMobileMenu = function () {};

  function showStatus(element, message, isError) {
    if (!element) return;
    element.textContent = message;
    element.classList.toggle("has_error", Boolean(isError));
  }

  function getGlobalStatus() {
    var status = document.querySelector("[data-auth-status]");
    if (!status) {
      status = document.createElement("p");
      status.className = "sr_only";
      status.setAttribute("data-auth-status", "");
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      document.body.appendChild(status);
    }
    return status;
  }

  function refreshAuth() {
    var session = null;
    if (storage) {
      try { session = storage.getSession(); }
      catch (error) { showStatus(getGlobalStatus(), error.message, true); }
    }
    document.querySelectorAll("[data-auth-guest]").forEach(function (element) { element.hidden = Boolean(session); });
    document.querySelectorAll("[data-auth-user], [data-auth-session]").forEach(function (element) { element.hidden = !session; });
    document.querySelectorAll("[data-auth-name]").forEach(function (element) {
      element.textContent = session ? session.name + "님" : "";
    });
    document.querySelectorAll("[data-session-name]").forEach(function (element) {
      element.textContent = session ? session.name : "";
    });
    return session;
  }

  function readFormValues(form) {
    var values = {};
    Array.from(form.elements).forEach(function (element) {
      if (element.name) values[element.name] = element.type === "checkbox" ? element.checked : element.value;
    });
    return values;
  }

  function getField(form, name) {
    return form.elements.namedItem(name);
  }

  function setFieldError(form, name, message) {
    var input = getField(form, name);
    var errorElement = Array.from(form.querySelectorAll("[data-error-for]")).find(function (element) {
      return element.dataset.errorFor === name;
    });
    if (input) {
      input.setAttribute("aria-invalid", message ? "true" : "false");
      var group = input.closest(".form_field, .form_check");
      if (group) group.classList.toggle("has_error", Boolean(message));
    }
    if (errorElement) errorElement.textContent = message || "";
  }

  function renderErrors(form, errors, shouldFocus) {
    Array.from(form.elements).forEach(function (input) {
      if (input.name) setFieldError(form, input.name, errors[input.name] || "");
    });
    var firstField = Object.keys(errors)[0];
    if (firstField && shouldFocus) {
      var field = getField(form, firstField);
      if (field) field.focus();
    }
  }

  function initPasswordToggles() {
    document.querySelectorAll("[data-password-toggle]").forEach(function (button) {
      var input = document.getElementById(button.dataset.passwordToggle);
      if (!input) return;
      var label = input.labels && input.labels.length ? input.labels[0].textContent.trim() : "비밀번호";
      function handlePasswordToggle() {
        var shouldShow = input.type === "password";
        input.type = shouldShow ? "text" : "password";
        button.setAttribute("aria-pressed", String(shouldShow));
        button.setAttribute("aria-label", label + (shouldShow ? " 숨기기" : " 표시하기"));
        button.textContent = shouldShow ? "숨김" : "표시";
      }
      button.addEventListener("click", handlePasswordToggle);
    });
  }

  function initPhoneFormatting(form) {
    var input = getField(form, "phone");
    if (!input) return;
    function handlePhoneInput() {
      var value = input.value;
      var caret = input.selectionStart;
      var digitsBeforeCaret = storage.normalizePhone(value.slice(0, caret === null ? value.length : caret)).length;
      var digits = storage.normalizePhone(value).slice(0, 11);
      var formatted = digits.slice(0, 3);
      if (digits.length > 3) formatted += "-" + digits.slice(3, 7);
      if (digits.length > 7) formatted += "-" + digits.slice(7);
      input.value = formatted;
      if (document.activeElement !== input || caret === null) return;
      var position = 0;
      var count = 0;
      while (position < formatted.length && count < digitsBeforeCaret) {
        if (/\d/.test(formatted.charAt(position))) count += 1;
        position += 1;
      }
      input.setSelectionRange(position, position);
    }
    input.addEventListener("input", handlePhoneInput);
  }

  function initAuthForm(form) {
    var isSignup = form.dataset.authForm === "signup";
    var status = form.querySelector("[data-form-status]");
    var submit = form.querySelector("button[type='submit']");
    var submitLabel = submit && (submit.querySelector("[data-submit-label]") || submit);
    var originalLabel = submitLabel ? submitLabel.textContent : "";
    var isSubmitting = false;
    var hasSubmitted = false;
    form.noValidate = true;
    if (!storage) {
      showStatus(status, "로그인 기능을 불러오지 못했습니다. 페이지를 새로고침해주세요.", true);
      if (submit) submit.disabled = true;
      return;
    }

    function validate(values) {
      return isSignup ? storage.validateSignup(values) : storage.validateLogin(values);
    }

    function setSubmitting(isPending) {
      isSubmitting = isPending;
      form.setAttribute("aria-busy", String(isPending));
      if (submit) submit.disabled = isPending;
      if (submitLabel) submitLabel.textContent = isPending ? (isSignup ? "가입 처리 중…" : "로그인 중…") : originalLabel;
    }
    setSubmitting(false);

    function handleFieldInput(event) {
      var field = event.target;
      if (!field.name || !hasSubmitted) return;
      var errors = validate(readFormValues(form));
      setFieldError(form, field.name, errors[field.name] || "");
      if (field.name === "password" && isSignup) setFieldError(form, "password_confirm", errors.password_confirm || "");
    }

    async function handleFormSubmit(event) {
      event.preventDefault();
      if (isSubmitting) return;
      hasSubmitted = true;
      var values = readFormValues(form);
      var errors = validate(values);
      renderErrors(form, errors, true);
      if (Object.keys(errors).length) {
        showStatus(status, "입력 내용을 확인해주세요. 표시된 항목을 수정한 후 다시 제출해주세요.", true);
        return;
      }
      setSubmitting(true);
      showStatus(status, isSignup ? "회원가입을 처리하고 있습니다." : "로그인 정보를 확인하고 있습니다.", false);
      var hasSucceeded = false;
      try {
        if (isSignup) {
          await storage.registerUser(values);
          showStatus(status, "회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.", false);
        } else {
          // Preference writes happen before login, avoiding a completed session
          // behind an error if saving the preference is denied by the browser.
          storage.setSavedEmail(values.save_email ? values.email : null);
          await storage.authenticate(values.email, values.password);
          refreshAuth();
          showStatus(status, "로그인되었습니다. 홈으로 이동합니다.", false);
        }
        form.querySelectorAll("input[autocomplete='new-password'], input[autocomplete='current-password']").forEach(function (input) { input.value = ""; });
        hasSucceeded = true;
        window.location.assign(isSignup ? (form.dataset.loginUrl || "./login.html") : (form.dataset.homeUrl || "../index.html"));
      } catch (error) {
        if (error.field) {
          var fieldErrors = {};
          fieldErrors[error.field] = error.message;
          renderErrors(form, fieldErrors, true);
        }
        showStatus(status, error.message || "요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.", true);
      } finally {
        if (!hasSucceeded) setSubmitting(false);
      }
    }

    form.addEventListener("submit", handleFormSubmit);
    form.addEventListener("input", handleFieldInput);
    form.addEventListener("change", handleFieldInput);
    window.addEventListener("pageshow", function handleAuthPageShow(event) {
      if (event.persisted && isSubmitting) {
        setSubmitting(false);
        showStatus(status, "", false);
      }
    });
    if (isSignup) {
      initPhoneFormatting(form);
    } else {
      var emailInput = getField(form, "email");
      var passwordInput = getField(form, "password");
      var saveEmail = getField(form, "save_email");
      try {
        var savedEmail = storage.getSavedEmail();
        var signupEmail = storage.consumeSignupNotice();
        if (emailInput) emailInput.value = signupEmail || savedEmail;
        if (saveEmail) saveEmail.checked = Boolean(savedEmail);
        if (signupEmail) {
          showStatus(status, "회원가입이 완료되었습니다. 등록한 이메일로 로그인해주세요.", false);
          if (!storage.getSession() && passwordInput) passwordInput.focus();
        }
      } catch (error) { showStatus(status, error.message, true); }
      if (saveEmail) {
        function handleSavedEmailChange() {
          if (saveEmail.checked) return;
          try { storage.setSavedEmail(null); }
          catch (error) { showStatus(status, error.message, true); }
        }
        saveEmail.addEventListener("change", handleSavedEmailChange);
      }
    }
  }

  function initMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    var overlay = document.querySelector("[data-menu-overlay]");
    if (!toggle || !menu) return;
    var desktopQuery = window.matchMedia("(min-width: 1024px)");
    var isOpen = false;

    function setOpen(shouldOpen, shouldReturnFocus) {
      isOpen = shouldOpen && !desktopQuery.matches;
      menu.hidden = !isOpen;
      menu.classList.toggle("is_open", isOpen);
      if (overlay) overlay.hidden = !isOpen;
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "메뉴 닫기" : "메뉴 열기");
      toggle.classList.toggle("is_open", isOpen);
      // Trial dialogs own has_modal_open independently.
      document.body.classList.toggle("has_menu_open", isOpen);
      if (!isOpen && shouldReturnFocus && toggle.getClientRects().length) toggle.focus();
    }

    closeMobileMenu = function (shouldReturnFocus) { setOpen(false, Boolean(shouldReturnFocus)); };
    function handleMenuToggle() { setOpen(!isOpen, false); }
    function handleMenuNavigation(event) {
      if (event.target.closest("a")) setOpen(false, false);
    }
    function handleOutsideClick(event) {
      if (isOpen && !menu.contains(event.target) && !toggle.contains(event.target)) setOpen(false, false);
    }
    function handleMenuEscape(event) {
      if (isOpen && event.key === "Escape") {
        event.preventDefault();
        setOpen(false, true);
      }
    }
    function handleDesktopChange() {
      if (!desktopQuery.matches) return;
      var hasMenuFocus = menu.contains(document.activeElement);
      setOpen(false, false);
      if (hasMenuFocus) {
        var home = document.querySelector(".header .logo");
        if (home) home.focus();
      }
    }
    toggle.addEventListener("click", handleMenuToggle);
    menu.addEventListener("click", handleMenuNavigation);
    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("keydown", handleMenuEscape);
    if (overlay) overlay.addEventListener("click", function handleOverlayClick() { setOpen(false, true); });
    if (typeof desktopQuery.addEventListener === "function") desktopQuery.addEventListener("change", handleDesktopChange);
    else desktopQuery.addListener(handleDesktopChange);
    setOpen(false, false);
  }

  function initAuth() {
    refreshAuth();
    initMobileMenu();
    initPasswordToggles();
    document.querySelectorAll("[data-auth-form]").forEach(initAuthForm);
    document.addEventListener("click", function handleLogout(event) {
      var button = event.target.closest("[data-auth-logout]");
      if (!button || !storage) return;
      try {
        storage.logout();
        closeMobileMenu(true);
        refreshAuth();
        showStatus(getGlobalStatus(), "로그아웃되었습니다.", false);
        if (!button.getClientRects().length) {
          var destination = document.querySelector("[data-auth-form] input") || document.querySelector(".header [data-auth-guest]");
          if (destination && destination.getClientRects().length) destination.focus();
        }
      } catch (error) { showStatus(getGlobalStatus(), error.message, true); }
    });
    window.addEventListener("storage", function handleStorageChange(event) {
      if (!storage || event.key === null || event.key === storage.keys.session || event.key === storage.keys.users) refreshAuth();
    });
    window.addEventListener("pageshow", refreshAuth);
  }

  window.F45Auth = Object.freeze({
    refresh: refreshAuth,
    closeMenu: function (shouldReturnFocus) { closeMobileMenu(shouldReturnFocus); }
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initAuth);
  else initAuth();
})();
