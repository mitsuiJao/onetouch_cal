const authBtn = document.getElementById('authBtn');
const authStatusEl = document.getElementById('authStatus');
const settingsBtn = document.getElementById('settingsBtn');

initTheme();
initI18n();

settingsBtn.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

authBtn.addEventListener('click', async () => {
  authBtn.disabled = true;
  authStatusEl.textContent = t('auth_authenticating');
  authStatusEl.classList.remove('error');
  try {
    await getToken(true);
    location.href = 'popup.html';
  } catch (err) {
    authStatusEl.textContent = t('common_errorPrefix', err.message);
    authStatusEl.classList.add('error');
    authBtn.disabled = false;
  }
});
