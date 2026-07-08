function pad2(n) {
  return String(n).padStart(2, '0');
}

function getToken(interactive) {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (token) => {
      if (chrome.runtime.lastError || !token) {
        reject(chrome.runtime.lastError || new Error('トークンを取得できませんでした'));
        return;
      }
      resolve(token);
    });
  });
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
  btn.title = isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え';
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
  });
}
