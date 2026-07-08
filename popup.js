const form = document.getElementById('eventForm');
const submitBtn = document.getElementById('submitBtn');
const statusEl = document.getElementById('status');
const settingsBtn = document.getElementById('settingsBtn');

const nativeFields = document.getElementById('nativeFields');
const separateTextFields = document.getElementById('separateTextFields');
const singleTextFields = document.getElementById('singleTextFields');

const subjectInput = document.getElementById('subject');
const dateInput = document.getElementById('date');
const startTimeInput = document.getElementById('startTime');
const endTimeInput = document.getElementById('endTime');

const subjectSepInput = document.getElementById('subjectSep');
const dateSepInput = document.getElementById('dateSep');
const startTimeSepInput = document.getElementById('startTimeSep');
const endTimeSepInput = document.getElementById('endTimeSep');

const singleInput = document.getElementById('singleInput');

let settings = { defaultDurationMinutes: 60, autoCloseOnSuccess: true, inputMode: 'native' };
let cachedToken = null;

function todayLocalDateString() {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
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

function buildEventBodyFromParts({ summary, date, startTime, endTime, endDate }) {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const resolvedEndDate = endDate || date;

  if (!startTime && !endTime) {
    return {
      summary,
      start: { date },
      end: { date: addDaysToDateString(date, 1) }
    };
  }

  let startDate = date;
  let sTime = startTime;
  let eDate = resolvedEndDate;
  let eTime = endTime;

  if (startTime && !endTime) {
    const startDt = new Date(`${date}T${startTime}:00`);
    const endDt = new Date(startDt.getTime() + settings.defaultDurationMinutes * 60000);
    const parts = localDateTimeParts(endDt);
    eDate = parts.date;
    eTime = parts.time;
  } else if (!startTime && endTime) {
    sTime = endTime;
    startDate = resolvedEndDate;
  }

  return {
    summary,
    start: { dateTime: `${startDate}T${sTime}:00`, timeZone },
    end: { dateTime: `${eDate}T${eTime}:00`, timeZone }
  };
}

function setStatus(text, kind) {
  statusEl.textContent = text;
  statusEl.classList.remove('error', 'success');
  if (kind) statusEl.classList.add(kind);
}

function applyInputMode(mode) {
  nativeFields.classList.toggle('hidden', mode !== 'native');
  separateTextFields.classList.toggle('hidden', mode !== 'separateText');
  singleTextFields.classList.toggle('hidden', mode !== 'singleText');
}

function extractEventParts() {
  if (settings.inputMode === 'separateText') {
    const parsed = parseSeparateTextFields(
      dateSepInput.value,
      startTimeSepInput.value,
      endTimeSepInput.value
    );
    if (!parsed) {
      setStatus('エラー: 日付または時刻の形式が正しくありません', 'error');
      return null;
    }
    return { summary: subjectSepInput.value.trim(), ...parsed };
  }

  if (settings.inputMode === 'singleText') {
    const result = parseSingleTextInput(singleInput.value);
    if (!result.ok) {
      setStatus(`エラー: ${result.message}`, 'error');
      return null;
    }
    return result;
  }

  return {
    summary: subjectInput.value.trim(),
    date: dateInput.value,
    startTime: startTimeInput.value,
    endTime: endTimeInput.value
  };
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
    const parts = extractEventParts();
    if (!parts) {
      return;
    }

    const body = buildEventBodyFromParts(parts);
    let token = cachedToken || await getToken(true);
    let resp = await insertEvent(token, body);

    if (resp.status === 401) {
      chrome.identity.removeCachedAuthToken({ token }, () => {});
      token = await getToken(true);
      resp = await insertEvent(token, body);
    }

    cachedToken = token;

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

initTheme();
wireThemeToggle('themeToggleBtn');

dateInput.value = todayLocalDateString();

chrome.storage.sync.get(
  { defaultDurationMinutes: 60, autoCloseOnSuccess: true, inputMode: 'native' },
  (stored) => {
    settings = stored;
    applyInputMode(settings.inputMode);
  }
);

(async () => {
  try {
    cachedToken = await getToken(false);
  } catch (err) {
    location.href = 'auth.html';
  }
})();
