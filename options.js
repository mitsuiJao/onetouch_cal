const durationSelect = document.getElementById('duration');
const durationSetting = document.getElementById('durationSetting');
const autoCloseCheckbox = document.getElementById('autoClose');
const inputModeRadios = document.querySelectorAll('input[name="inputMode"]');
const resetAuthBtn = document.getElementById('resetAuthBtn');
const statusEl = document.getElementById('status');

initTheme();
wireThemeToggle('themeToggleBtn');

function updateDurationVisibility(mode) {
  durationSetting.classList.toggle('hidden', mode === 'singleText');
}

chrome.storage.sync.get(
  { defaultDurationMinutes: 60, autoCloseOnSuccess: true, inputMode: 'native' },
  (stored) => {
    durationSelect.value = String(stored.defaultDurationMinutes);
    autoCloseCheckbox.checked = stored.autoCloseOnSuccess;
    const checkedRadio = document.querySelector(`input[name="inputMode"][value="${stored.inputMode}"]`);
    if (checkedRadio) checkedRadio.checked = true;
    updateDurationVisibility(stored.inputMode);
  }
);

durationSelect.addEventListener('change', () => {
  chrome.storage.sync.set({ defaultDurationMinutes: Number(durationSelect.value) });
});

autoCloseCheckbox.addEventListener('change', () => {
  chrome.storage.sync.set({ autoCloseOnSuccess: autoCloseCheckbox.checked });
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
      statusEl.textContent = '解除するトークンがありませんでした（未接続の可能性があります）';
      statusEl.classList.add('success');
      return;
    }
    chrome.identity.removeCachedAuthToken({ token }, async () => {
      try {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        statusEl.textContent = '接続をリセットしました。次回追加時に再認証されます。';
        statusEl.classList.remove('error');
        statusEl.classList.add('success');
      } catch (err) {
        statusEl.textContent = `エラー: ${err.message}`;
        statusEl.classList.remove('success');
        statusEl.classList.add('error');
      }
    });
  });
});
