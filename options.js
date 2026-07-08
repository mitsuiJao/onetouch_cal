const durationSelect = document.getElementById('duration');
const autoCloseCheckbox = document.getElementById('autoClose');
const resetAuthBtn = document.getElementById('resetAuthBtn');
const statusEl = document.getElementById('status');

chrome.storage.sync.get(
  { defaultDurationMinutes: 60, autoCloseOnSuccess: true },
  (stored) => {
    durationSelect.value = String(stored.defaultDurationMinutes);
    autoCloseCheckbox.checked = stored.autoCloseOnSuccess;
  }
);

durationSelect.addEventListener('change', () => {
  chrome.storage.sync.set({ defaultDurationMinutes: Number(durationSelect.value) });
});

autoCloseCheckbox.addEventListener('change', () => {
  chrome.storage.sync.set({ autoCloseOnSuccess: autoCloseCheckbox.checked });
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
