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
