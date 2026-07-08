function parseDateToken(token) {
  const sep = token.includes('/') ? '/' : (token.includes('-') ? '-' : null);
  if (!sep) return null;

  const parts = token.split(sep);
  let y;
  let m;
  let d;

  if (parts.length === 3) {
    if (!/^\d{4}$/.test(parts[0]) || !/^\d{1,2}$/.test(parts[1]) || !/^\d{1,2}$/.test(parts[2])) return null;
    y = Number(parts[0]);
    m = Number(parts[1]);
    d = Number(parts[2]);
  } else if (parts.length === 2) {
    if (!/^\d{1,2}$/.test(parts[0]) || !/^\d{1,2}$/.test(parts[1])) return null;
    y = new Date().getFullYear();
    m = Number(parts[0]);
    d = Number(parts[1]);
  } else {
    return null;
  }

  if (m < 1 || m > 12 || d < 1 || d > 31) return null;

  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() + 1 !== m || dt.getDate() !== d) return null;

  return `${y}-${pad2(m)}-${pad2(d)}`;
}

function parseTimeToken(token) {
  let h;
  let mi;

  if (token.includes(':')) {
    const parts = token.split(':');
    if (parts.length !== 2 || !/^\d{1,2}$/.test(parts[0]) || !/^\d{2}$/.test(parts[1])) return null;
    h = Number(parts[0]);
    mi = Number(parts[1]);
  } else if (/^\d{3,4}$/.test(token)) {
    if (token.length === 3) {
      h = Number(token.slice(0, 1));
      mi = Number(token.slice(1));
    } else {
      h = Number(token.slice(0, 2));
      mi = Number(token.slice(2));
    }
  } else {
    return null;
  }

  if (h < 0 || h > 23 || mi < 0 || mi > 59) return null;

  return `${pad2(h)}:${pad2(mi)}`;
}

function parseSeparateTextFields(dateStr, startStr, endStr) {
  const trimmedDate = dateStr.trim();
  const date = trimmedDate ? parseDateToken(trimmedDate) : todayLocalDateString();
  if (date === null) return null;

  let startTime = '';
  let endTime = '';

  if (startStr.trim()) {
    startTime = parseTimeToken(startStr.trim());
    if (startTime === null) return null;
  }

  if (endStr.trim()) {
    endTime = parseTimeToken(endStr.trim());
    if (endTime === null) return null;
  }

  return { date, startTime, endTime };
}

function classifyToken(token) {
  if (token.includes('/') || token.includes('-')) {
    return 'D';
  }
  if (token.includes(':') || /^\d{3,4}$/.test(token)) {
    return 'T';
  }
  return null;
}

function parseSingleTextInput(input) {
  const tokens = input.trim().split(/\s+/).filter(Boolean);
  const trailing = [];

  let i = tokens.length - 1;
  while (i >= 0 && trailing.length < 4) {
    const type = classifyToken(tokens[i]);
    if (!type) break;

    const value = type === 'D' ? parseDateToken(tokens[i]) : parseTimeToken(tokens[i]);
    if (value === null) {
      return { ok: false, message: `「${tokens[i]}」の形式が正しくありません` };
    }

    trailing.unshift({ type, value });
    i--;
  }

  const summary = tokens.slice(0, i + 1).join(' ').trim();
  if (!summary) {
    return { ok: false, message: '件名を入力してください' };
  }

  const shape = trailing.map((t) => t.type).join(',');
  const today = todayLocalDateString();

  switch (shape) {
    case 'D':
      return { ok: true, summary, date: trailing[0].value, startTime: '', endTime: '' };
    case 'T':
      return { ok: true, summary, date: today, startTime: trailing[0].value, endTime: trailing[0].value };
    case 'T,T':
      return { ok: true, summary, date: today, startTime: trailing[0].value, endTime: trailing[1].value };
    case 'D,T':
      return { ok: true, summary, date: trailing[0].value, startTime: trailing[1].value, endTime: trailing[1].value };
    case 'D,T,T':
      return { ok: true, summary, date: trailing[0].value, startTime: trailing[1].value, endTime: trailing[2].value };
    case 'D,T,D,T':
      return {
        ok: true,
        summary,
        date: trailing[0].value,
        startTime: trailing[1].value,
        endDate: trailing[2].value,
        endTime: trailing[3].value
      };
    default:
      return { ok: false, message: '日付・時刻の形式を認識できませんでした' };
  }
}
