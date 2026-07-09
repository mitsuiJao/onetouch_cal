const durationSelect = document.getElementById('duration');
const durationSetting = document.getElementById('durationSetting');
const closeDelaySelect = document.getElementById('closeDelay');
const inputModeRadios = document.querySelectorAll('input[name="inputMode"]');
const languageSelect = document.getElementById('languageSelect');
const resetAuthBtn = document.getElementById('resetAuthBtn');
const statusEl = document.getElementById('status');

initTheme();
wireThemeToggle('themeToggleBtn');
initI18n();

function updateDurationVisibility(mode) {
  durationSetting.classList.toggle('hidden', mode === 'singleText');
}

chrome.storage.sync.get(
  { defaultDurationMinutes: 60, closeDelaySeconds: 5, inputMode: 'native', language: 'auto' },
  (stored) => {
    durationSelect.value = String(stored.defaultDurationMinutes);
    closeDelaySelect.value = String(stored.closeDelaySeconds);
    const checkedRadio = document.querySelector(`input[name="inputMode"][value="${stored.inputMode}"]`);
    if (checkedRadio) checkedRadio.checked = true;
    updateDurationVisibility(stored.inputMode);
    languageSelect.value = stored.language;
  }
);

languageSelect.addEventListener('change', () => {
  chrome.storage.sync.set({ language: languageSelect.value });
});

durationSelect.addEventListener('change', () => {
  chrome.storage.sync.set({ defaultDurationMinutes: Number(durationSelect.value) });
});

closeDelaySelect.addEventListener('change', () => {
  chrome.storage.sync.set({ closeDelaySeconds: Number(closeDelaySelect.value) });
});

inputModeRadios.forEach((radio) => {
  radio.addEventListener('change', () => {
    if (radio.checked) {
      chrome.storage.sync.set({ inputMode: radio.value });
      updateDurationVisibility(radio.value);
    }
  });
});

resetAuthBtn.addEventListener('click', () => {
  chrome.identity.getAuthToken({ interactive: false }, (token) => {
    if (chrome.runtime.lastError || !token) {
      statusEl.textContent = t('options_noTokenToRevoke');
      statusEl.classList.add('success');
      return;
    }
    chrome.identity.removeCachedAuthToken({ token }, async () => {
      try {
        const resp = await fetch('https://oauth2.googleapis.com/revoke', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: `token=${encodeURIComponent(token)}` });
        if (!resp.ok) throw new Error(String(resp.status));
        statusEl.textContent = t('options_resetSuccess');
        statusEl.classList.remove('error');
        statusEl.classList.add('success');
      } catch (err) {
        statusEl.textContent = t('common_errorPrefix', err.message);
        statusEl.classList.remove('success');
        statusEl.classList.add('error');
      }
    });
  });
});
