const authBtn = document.getElementById('authBtn');
const authStatusEl = document.getElementById('authStatus');

authBtn.addEventListener('click', async () => {
  authBtn.disabled = true;
  authStatusEl.textContent = '認証中…';
  authStatusEl.classList.remove('error');
  try {
    await getToken(true);
    location.href = 'popup.html';
  } catch (err) {
    authStatusEl.textContent = `エラー: ${err.message}`;
    authStatusEl.classList.add('error');
    authBtn.disabled = false;
  }
});
