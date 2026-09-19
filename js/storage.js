(function () {
  "use strict";

  // Portfolio demo only. Browser data can be edited by its owner; these hashes
  // do not turn this static site into a server-authenticated member service.
  var storageKeys = Object.freeze({
    users: "f45_demo_users_v1",
    session: "f45_demo_session_v1",
    savedEmail: "f45_saved_email_v1",
    signupEmail: "f45_signup_email_v1",
    signupSuccess: "f45_signup_success_v1"
  });
  // The v1 format uses this fixed work factor, SHA-256 and a 256-bit key.
  var passwordIterations = 120000;
  var isRegistering = false;

  function createError(code, message, field) {
    var error = new Error(message);
    error.code = code;
    if (field) error.field = field;
    return error;
  }

  function accessStorage(type, action, key, value) {
    try {
      var storage = type === "session" ? window.sessionStorage : window.localStorage;
      if (action === "get") return storage.getItem(key);
      if (action === "set") storage.setItem(key, value);
      if (action === "remove") storage.removeItem(key);
      return null;
    } catch (error) {
      throw createError("storage_unavailable", "브라우저 저장소를 사용할 수 없습니다. 저장 공간과 사이트 저장 허용 설정을 확인해주세요.");
    }
  }

  function normalizeEmail(value) {
    return typeof value === "string" ? value.trim().toLowerCase() : "";
  }

  function normalizePhone(value) {
    return typeof value === "string" ? value.replace(/\D/g, "") : "";
  }

  function isValidName(value) {
    return typeof value === "string" && value === value.trim() &&
      Array.from(value).length >= 2 && Array.from(value).length <= 30 &&
      !/^[\d\s]+$/.test(value) && !/[\u0000-\u001f\u007f]/.test(value);
  }

  function isValidEmail(value) {
    return typeof value === "string" && value.length <= 254 &&
      value === normalizeEmail(value) && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value);
  }

  function validateSignup(data) {
    var errors = {};
    var values = data && typeof data === "object" ? data : {};
    var name = typeof values.name === "string" ? values.name.trim() : "";
    var password = typeof values.password === "string" ? values.password : "";
    if (!isValidName(name)) errors.name = "이름은 숫자만 사용하지 않고 2~30자로 입력해주세요.";
    if (!isValidEmail(normalizeEmail(values.email))) errors.email = "이메일 주소를 올바르게 입력해주세요. 예: name@example.com";
    if (!/^010\d{8}$/.test(normalizePhone(values.phone))) errors.phone = "010으로 시작하는 휴대전화 번호 11자리를 입력해주세요.";
    if (password.length < 8 || password.length > 20 || !/[a-z]/i.test(password) ||
      !/\d/.test(password) || !/[!-/:-@\[-`{-~]/.test(password) || /\s/.test(password)) {
      errors.password = "비밀번호는 공백 없이 영문·숫자·특수문자를 포함한 8~20자로 입력해주세요.";
    }
    if (!values.password_confirm || values.password_confirm !== password) errors.password_confirm = "비밀번호가 일치하지 않습니다. 같은 비밀번호를 다시 입력해주세요.";
    if (values.terms !== true) errors.terms = "이용약관에 동의해주세요.";
    if (values.privacy !== true) errors.privacy = "개인정보 수집 및 이용에 동의해주세요.";
    return errors;
  }

  function validateLogin(data) {
    var errors = {};
    var values = data && typeof data === "object" ? data : {};
    if (!isValidEmail(normalizeEmail(values.email))) errors.email = "이메일 주소를 올바르게 입력해주세요. 예: name@example.com";
    if (typeof values.password !== "string" || !values.password || /\s/.test(values.password)) {
      errors.password = "가입한 비밀번호를 공백 없이 입력해주세요.";
    } else if (values.password.length > 20) {
      errors.password = "비밀번호는 20자 이하로 입력해주세요.";
    }
    return errors;
  }

  function hasExactFields(value, fields) {
    return value !== null && typeof value === "object" && !Array.isArray(value) &&
      Object.keys(value).length === fields.length && fields.every(function (field) {
        return Object.prototype.hasOwnProperty.call(value, field);
      });
  }

  function isValidDate(value) {
    if (typeof value !== "string" || value.length !== 24) return false;
    var timestamp = Date.parse(value);
    return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
  }

  function isValidId(value) {
    return typeof value === "string" && /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(value);
  }

  function isValidBase64(value, length) {
    if (typeof value !== "string") return false;
    try {
      var decoded = window.atob(value);
      return decoded.length === length && window.btoa(decoded) === value;
    } catch (error) {
      return false;
    }
  }

  function isValidUser(user) {
    return hasExactFields(user, ["id", "name", "email", "phone", "passwordHash", "salt", "termsAccepted", "privacyAccepted", "createdAt"]) &&
      isValidId(user.id) && isValidName(user.name) && isValidEmail(user.email) &&
      typeof user.phone === "string" && /^010\d{8}$/.test(user.phone) &&
      isValidBase64(user.passwordHash, 32) && isValidBase64(user.salt, 16) &&
      user.termsAccepted === true && user.privacyAccepted === true && isValidDate(user.createdAt);
  }

  function isValidUsers(users) {
    if (!Array.isArray(users)) return false;
    var emails = new Set();
    var ids = new Set();
    return users.every(function (user) {
      if (!isValidUser(user) || emails.has(user.email) || ids.has(user.id)) return false;
      emails.add(user.email);
      ids.add(user.id);
      return true;
    });
  }

  function readValidatedJson(key, validator, fallback) {
    var raw = accessStorage("local", "get", key);
    if (raw === null) return fallback;
    var value;
    try {
      value = JSON.parse(raw);
    } catch (error) {
      value = undefined;
    }
    if (!validator(value)) {
      // Reset only the damaged entry, never other sites' or app keys.
      accessStorage("local", "remove", key);
      return fallback;
    }
    return value;
  }

  function readUsers() {
    return readValidatedJson(storageKeys.users, isValidUsers, []);
  }

  function requireCrypto() {
    if (!window.crypto || !window.crypto.subtle || typeof window.crypto.getRandomValues !== "function") {
      throw createError("crypto_unavailable", "이 브라우저에서는 안전한 비밀번호 처리를 지원하지 않습니다. HTTPS 또는 localhost에서 최신 브라우저로 이용해주세요.");
    }
  }

  function encodeBase64(bytes) {
    return window.btoa(String.fromCharCode.apply(null, bytes));
  }

  function decodeBase64(value) {
    return Uint8Array.from(window.atob(value), function (character) { return character.charCodeAt(0); });
  }

  function createUserId() {
    if (typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
    var bytes = window.crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    var hex = Array.from(bytes, function (byte) { return byte.toString(16).padStart(2, "0"); }).join("");
    return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join("-");
  }

  async function derivePassword(password, salt) {
    requireCrypto();
    try {
      var key = await window.crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
      var bits = await window.crypto.subtle.deriveBits({ name: "PBKDF2", salt: salt, iterations: passwordIterations, hash: "SHA-256" }, key, 256);
      return encodeBase64(new Uint8Array(bits));
    } catch (error) {
      throw createError("crypto_failed", "비밀번호를 처리하지 못했습니다. 잠시 후 다시 시도해주세요.");
    }
  }

  function clearSignupNotice() {
    accessStorage("session", "remove", storageKeys.signupEmail);
    accessStorage("session", "remove", storageKeys.signupSuccess);
  }

  function setSignupNotice(email) {
    var normalized = normalizeEmail(email);
    if (!isValidEmail(normalized)) throw createError("invalid_email", "올바른 이메일 주소를 입력해주세요.", "email");
    try {
      accessStorage("session", "set", storageKeys.signupEmail, normalized);
      accessStorage("session", "set", storageKeys.signupSuccess, "true");
    } catch (error) {
      try { clearSignupNotice(); } catch (cleanupError) { /* Original storage error is shown to the user. */ }
      throw error;
    }
  }

  function consumeSignupNotice() {
    var email = accessStorage("session", "get", storageKeys.signupEmail);
    var success = accessStorage("session", "get", storageKeys.signupSuccess);
    if (email === null && success === null) return null;
    clearSignupNotice();
    return success === "true" && isValidEmail(email) ? email : null;
  }

  async function registerUser(data) {
    var errors = validateSignup(data);
    var firstField = Object.keys(errors)[0];
    if (firstField) throw createError("invalid_signup", errors[firstField], firstField);
    if (isRegistering) throw createError("registration_pending", "회원가입을 처리하고 있습니다. 잠시 기다려주세요.");
    requireCrypto();
    isRegistering = true;
    async function saveUser() {
      var email = normalizeEmail(data.email);
      if (readUsers().some(function (user) { return user.email === email; })) {
        throw createError("duplicate_email", "이미 가입된 이메일입니다. 로그인해주세요.", "email");
      }
      var salt = window.crypto.getRandomValues(new Uint8Array(16));
      var passwordHash = await derivePassword(data.password, salt);
      // Re-read after asynchronous hashing so other completed signups survive.
      var users = readUsers();
      if (users.some(function (user) { return user.email === email; })) {
        throw createError("duplicate_email", "이미 가입된 이메일입니다. 로그인해주세요.", "email");
      }
      var user = {
        id: createUserId(), name: data.name.trim(), email: email,
        phone: normalizePhone(data.phone), passwordHash: passwordHash, salt: encodeBase64(salt),
        termsAccepted: true, privacyAccepted: true, createdAt: new Date().toISOString()
      };
      // Check the temporary hand-off first; failed storage must not leave a
      // created account behind an error message inviting duplicate signup.
      setSignupNotice(email);
      try {
        accessStorage("local", "set", storageKeys.users, JSON.stringify(users.concat(user)));
      } catch (error) {
        try { clearSignupNotice(); } catch (cleanupError) { /* Preserve the original failure. */ }
        throw error;
      }
      return { id: user.id, name: user.name, email: user.email };
    }
    try {
      // Supported browsers also serialize registration between open tabs.
      if (window.navigator && window.navigator.locks && typeof window.navigator.locks.request === "function") {
        return await window.navigator.locks.request(storageKeys.users, saveUser);
      }
      return await saveUser();
    } finally {
      isRegistering = false;
    }
  }

  function isValidSession(session) {
    return hasExactFields(session, ["userId", "name", "email", "loggedInAt"]) &&
      isValidId(session.userId) && isValidName(session.name) && isValidEmail(session.email) && isValidDate(session.loggedInAt);
  }

  function getSession() {
    var session = readValidatedJson(storageKeys.session, isValidSession, null);
    if (!session) return null;
    var hasUser = readUsers().some(function (user) {
      return user.id === session.userId && user.name === session.name && user.email === session.email;
    });
    if (!hasUser) {
      accessStorage("local", "remove", storageKeys.session);
      return null;
    }
    return session;
  }

  async function authenticate(email, password) {
    var normalized = normalizeEmail(email);
    var errors = validateLogin({ email: normalized, password: password });
    var firstField = Object.keys(errors)[0];
    if (firstField) throw createError("invalid_login", errors[firstField], firstField);
    var user = readUsers().find(function (entry) { return entry.email === normalized; });
    if (!user) throw createError("email_not_found", "가입되지 않은 이메일입니다. 이메일을 확인하거나 회원가입해주세요.", "email");
    var hash = await derivePassword(password, decodeBase64(user.salt));
    var difference = 0;
    for (var index = 0; index < hash.length; index += 1) difference |= hash.charCodeAt(index) ^ user.passwordHash.charCodeAt(index);
    if (difference !== 0) throw createError("password_incorrect", "비밀번호가 일치하지 않습니다. 다시 입력해주세요.", "password");
    // Do not establish a session if the account changed while hashing.
    var hasSameUser = readUsers().some(function (entry) {
      return entry.id === user.id && entry.email === user.email && entry.passwordHash === user.passwordHash && entry.salt === user.salt;
    });
    if (!hasSameUser) throw createError("account_changed", "계정 정보가 변경되었습니다. 다시 로그인해주세요.");
    var session = { userId: user.id, name: user.name, email: user.email, loggedInAt: new Date().toISOString() };
    accessStorage("local", "set", storageKeys.session, JSON.stringify(session));
    return session;
  }

  function logout() {
    accessStorage("local", "remove", storageKeys.session);
  }

  function getSavedEmail() {
    var email = accessStorage("local", "get", storageKeys.savedEmail);
    if (email === null) return "";
    if (!isValidEmail(email)) {
      accessStorage("local", "remove", storageKeys.savedEmail);
      return "";
    }
    return email;
  }

  function setSavedEmail(email) {
    if (email === null || email === "") {
      accessStorage("local", "remove", storageKeys.savedEmail);
      return;
    }
    var normalized = normalizeEmail(email);
    if (!isValidEmail(normalized)) throw createError("invalid_email", "올바른 이메일 주소를 입력해주세요.", "email");
    accessStorage("local", "set", storageKeys.savedEmail, normalized);
  }

  window.F45Storage = Object.freeze({
    keys: storageKeys, normalizeEmail: normalizeEmail, normalizePhone: normalizePhone,
    validateSignup: validateSignup, validateLogin: validateLogin,
    registerUser: registerUser, authenticate: authenticate, getSession: getSession,
    logout: logout, getSavedEmail: getSavedEmail, setSavedEmail: setSavedEmail,
    setSignupNotice: setSignupNotice, consumeSignupNotice: consumeSignupNotice
  });
})();
