function pad2(n) {
  return String(n).padStart(2, '0');
}

function getToken(interactive) {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (token) => {
      if (chrome.runtime.lastError || !token) {
        reject(chrome.runtime.lastError || new Error(t('common_tokenUnavailable')));
        return;
      }
      resolve(token);
    });
  });
}

const LANGUAGE_SYNC_KEY = 'language';
let overrideMessages = null;

function substituteMessage(entry, subs) {
  if (!entry) return '';
  let msg = entry.message;
  if (entry.placeholders) {
    for (const [name, def] of Object.entries(entry.placeholders)) {
      msg = msg.split(`$${name.toUpperCase()}$`).join(def.content);
    }
  }
  const list = Array.isArray(subs) ? subs : (subs !== undefined ? [subs] : []);
  list.forEach((sub, i) => { msg = msg.split(`$${i + 1}`).join(sub); });
  return msg;
}

function t(key, subs) {
  if (overrideMessages) return substituteMessage(overrideMessages[key], subs);
  return chrome.i18n.getMessage(key, subs);
}

async function loadOverrideMessages(locale) {
  const res = await fetch(chrome.runtime.getURL(`_locales/${locale}/messages.json`));
  return res.json();
}

function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    const msg = t(el.getAttribute('data-i18n'));
    if (msg) el.textContent = msg;
  });
  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const msg = t(el.getAttribute('data-i18n-placeholder'));
    if (msg) el.setAttribute('placeholder', msg);
  });
  root.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const msg = t(el.getAttribute('data-i18n-title'));
    if (msg) el.setAttribute('title', msg);
  });
  root.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    const msg = t(el.getAttribute('data-i18n-aria-label'));
    if (msg) el.setAttribute('aria-label', msg);
  });
}

async function initI18n() {
  const stored = await new Promise((resolve) => chrome.storage.sync.get({ [LANGUAGE_SYNC_KEY]: 'auto' }, resolve));
  overrideMessages = stored[LANGUAGE_SYNC_KEY] === 'auto' ? null : await loadOverrideMessages(stored[LANGUAGE_SYNC_KEY]);
  applyI18n();
  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) updateThemeToggleButton(themeBtn, document.documentElement.getAttribute('data-theme') || 'light');
}

const THEME_STORAGE_KEY = 'otc-theme';
const THEME_SYNC_KEY = 'theme';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function updateThemeToggleButton(btn, theme) {
  if (!btn) return;
  const isDark = theme === 'dark';
  btn.textContent = isDark ? '☀' : '☾';
  btn.title = t(isDark ? 'common_themeToggleToLight' : 'common_themeToggleToDark');
  btn.setAttribute('aria-label', btn.title);
}

function initTheme() {
  chrome.storage.sync.get({ [THEME_SYNC_KEY]: null }, (stored) => {
    let theme = stored[THEME_SYNC_KEY];
    if (theme !== 'dark' && theme !== 'light') {
      theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    applyTheme(theme);
    updateThemeToggleButton(document.getElementById('themeToggleBtn'), theme);
  });
}

function setTheme(theme) {
  applyTheme(theme);
  chrome.storage.sync.set({ [THEME_SYNC_KEY]: theme });
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

function wireThemeToggle(buttonId) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  updateThemeToggleButton(btn, document.documentElement.getAttribute('data-theme') || 'light');
  btn.addEventListener('click', () => {
    updateThemeToggleButton(btn, toggleTheme());
  });
}

if (chrome.storage && chrome.storage.onChanged) {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes[THEME_SYNC_KEY]) {
      const theme = changes[THEME_SYNC_KEY].newValue;
      applyTheme(theme);
      updateThemeToggleButton(document.getElementById('themeToggleBtn'), theme);
    }
    if (area === 'sync' && changes[LANGUAGE_SYNC_KEY]) {
      initI18n();
    }
  });
}
