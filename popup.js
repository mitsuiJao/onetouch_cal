const form = document.getElementById('eventForm');
const subjectInput = document.getElementById('subject');
const dateInput = document.getElementById('date');
const startTimeInput = document.getElementById('startTime');
const endTimeInput = document.getElementById('endTime');
const submitBtn = document.getElementById('submitBtn');
const statusEl = document.getElementById('status');
const settingsBtn = document.getElementById('settingsBtn');

let settings = { defaultDurationMinutes: 60, autoCloseOnSuccess: true };

function todayLocalDateString() {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function localDateTimeParts(dateObj) {
  return {
    date: `${dateObj.getFullYear()}-${pad2(dateObj.getMonth() + 1)}-${pad2(dateObj.getDate())}`,
    time: `${pad2(dateObj.getHours())}:${pad2(dateObj.getMinutes())}`
  };
}

function addDaysToDateString(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
}

function buildEventBody() {
  const summary = subjectInput.value.trim();
  const date = dateInput.value;
  const start = startTimeInput.value;
  const end = endTimeInput.value;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (!start && !end) {
    return {
      summary,
      start: { date },
      end: { date: addDaysToDateString(date, 1) }
    };
  }

  let startDate = date;
  let startTime = start;
  let endDate = date;
  let endTime = end;

  if (start && !end) {
    const startDt = new Date(`${date}T${start}:00`);
    const endDt = new Date(startDt.getTime() + settings.defaultDurationMinutes * 60000);
    const parts = localDateTimeParts(endDt);
    endDate = parts.date;
    endTime = parts.time;
  } else if (!start && end) {
    startTime = end;
  }

  return {
    summary,
    start: { dateTime: `${startDate}T${startTime}:00`, timeZone },
    end: { dateTime: `${endDate}T${endTime}:00`, timeZone }
  };
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

function setStatus(text, kind) {
  statusEl.textContent = text;
  statusEl.classList.remove('error', 'success');
  if (kind) statusEl.classList.add(kind);
}

async function insertEvent(token, body) {
  return fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  setStatus('追加中…', null);

  try {
    const body = buildEventBody();
    let token = await getToken(true);
    let resp = await insertEvent(token, body);

    if (resp.status === 401) {
      chrome.identity.removeCachedAuthToken({ token }, () => {});
      token = await getToken(true);
      resp = await insertEvent(token, body);
    }

    if (!resp.ok) {
      throw new Error(`登録に失敗しました (${resp.status})`);
    }

    setStatus('追加しました', 'success');
    if (settings.autoCloseOnSuccess) {
      setTimeout(() => window.close(), 1200);
    }
  } catch (err) {
    setStatus(`エラー: ${err.message}`, 'error');
  } finally {
    submitBtn.disabled = false;
  }
});

settingsBtn.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

dateInput.value = todayLocalDateString();

chrome.storage.sync.get(
  { defaultDurationMinutes: 60, autoCloseOnSuccess: true },
  (stored) => {
    settings = stored;
  }
);
