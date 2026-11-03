/**
 * ============================================================================
 * SKILLSWAP UoH - GOOGLE APPS SCRIPT WEB APP BACKEND API (R4)
 * Course: IE209 Skill Development Mini-Project
 * School of Computer and Information Sciences (SCIS), University of Hyderabad
 * "Teach what you know, learn what you need • time credits, not money"
 * ============================================================================
 */

// Secret API key to prevent unauthorized access (shared with frontend client)
const KEY = 'team-secret-123';

/**
 * Main GET request router
 */
function doGet(e) {
  return handleRequest(e ? e.parameter : {});
}

/**
 * Main POST request router (supports URL encoded parameters and JSON payloads)
 */
function doPost(e) {
  let params = {};
  if (e && e.postData && e.postData.contents) {
    try {
      params = JSON.parse(e.postData.contents);
    } catch (err) {
      params = e.parameter || {};
    }
  } else if (e && e.parameter) {
    params = e.parameter;
  }
  return handleRequest(params);
}

/**
 * Unified request handler with authentication, routing, and error isolation
 */
function handleRequest(p) {
  if (!p || p.key !== KEY) {
    return out(p ? p.action : 'unknown', { error: 'bad key' });
  }

  // Serialize reads and writes together so pending-credit checks cannot race.
  // confirm() owns the same lock itself and must not acquire it twice.
  const lock = p.action === 'confirm' ? null : LockService.getScriptLock();
  try {
    if (lock) lock.waitLock(10000);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const result = route(ss, p);
    return out(p.action, result);
  } catch (err) {
    return out(p.action, { error: String(err.message || err) });
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}

/**
 * Read all rows of a sheet tab as an array of JavaScript objects
 */
function rows(ss, tab) {
  if (tab === 'Slots') return readSlotTable(ss).slots;
  const sheet = ss.getSheetByName(tab);
  if (!sheet) return [];
  const v = sheet.getDataRange().getDisplayValues();
  if (!v || v.length <= 1) return [];
  const h = v.shift();
  return v.map(r => Object.fromEntries(h.map((k, i) => [k, r[i]])));
}

// Slot dates/times are domain values, never locale-dependent display strings.
function readSlotTable(ss) {
  const sheet = ss.getSheetByName('Slots');
  if (!sheet) return { headers: [], slots: [] };
  const values = sheet.getDataRange().getValues();
  if (!values.length) return { headers: [], slots: [] };
  const headers = values[0].map(String);
  const timezone = ss.getSpreadsheetTimeZone();
  const slots = values.slice(1).map(row => Object.fromEntries(headers.map((key, index) => {
    const raw = row[index];
    if (key === 'time') return [key, normalizeSlotTime(raw, timezone)];
    if (key === 'date') return [key, normalizeSlotDate(raw, timezone)];
    return [key, raw == null ? '' : String(raw)];
  })));
  return { headers: headers, slots: slots };
}

function normalizeSlotTime(value, timezone) {
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return isNaN(value.getTime()) ? '' : Utilities.formatDate(value, timezone, 'HH:mm');
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value < 0) return '';
    // Sheets serial times are fractions of a day; ignore floating-point noise.
    const minutes = Math.floor(((value % 1) * 1440) + 1e-7) % 1440;
    return String(Math.floor(minutes / 60)).padStart(2, '0') + ':' + String(minutes % 60).padStart(2, '0');
  }
  const match = /^(\d{1,2}):([0-5]\d)(?::[0-5]\d(?:\.\d+)?)?$/.exec(String(value == null ? '' : value).trim());
  if (!match || Number(match[1]) > 23) return '';
  return match[1].padStart(2, '0') + ':' + match[2];
}

function normalizeSlotDate(value, timezone) {
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return isNaN(value.getTime()) ? '' : Utilities.formatDate(value, timezone, 'yyyy-MM-dd');
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return '';
    const date = new Date(Date.UTC(1899, 11, 30) + Math.floor(value) * 86400000);
    return isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
  }
  return String(value == null ? '' : value).trim();
}

function appendSlot(ss, values) {
  // Explicit stringValue bypasses Sheets' USER_ENTERED parsing. A text format
  // alone does not prevent appendRow from coercing a clock string into a time.
  Sheets.Spreadsheets.batchUpdate({ requests: [{ appendCells: {
    sheetId: ss.getSheetByName('Slots').getSheetId(),
    rows: [{ values: values.map(value => ({ userEnteredValue: { stringValue: String(value) }, userEnteredFormat: { numberFormat: { type: 'TEXT' } } })) }],
    fields: 'userEnteredValue,userEnteredFormat.numberFormat'
  } }] }, ss.getId());
}

/**
 * Formats standard JSON output with action header and CORS headers
 */
function out(action, data) {
  const output = ContentService.createTextOutput(
    JSON.stringify({ action: action || 'ping', data: data })
  );
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

/**
 * Central API router matching IE209 Mini-Project specification Section 4D
 */
function route(ss, p) {
  const action = p.action;
  const email = (p.email || '').toLowerCase().trim();

  // Ping / health check
  if (action === 'ping') {
    return { status: 'healthy', timestamp: new Date().toISOString(), university: 'University of Hyderabad' };
  }

  // 1. LOGIN / SIGNUP (FR-1)
  if (action === 'login') {
    if (!/^[^\s@]+@uohyd\.ac\.in$/.test(email)) {
      return { error: 'Use your university email (@uohyd.ac.in)' };
    }
    const allUsers = rows(ss, 'Users');
    let me = allUsers.find(u => u.email.toLowerCase() === email);

    if (!me) {
      // New user starts with exactly 2 credits per FR-1
      const defaultNick = p.nick ? p.nick.trim() : email.split('@')[0];
      ss.getSheetByName('Users').appendRow([email, defaultNick, '', '', 2]);
      return {
        email: email,
        nick: defaultNick,
        credits: 2,
        isNew: true,
        offers: [],
        wants: []
      };
    }

    return {
      email: me.email,
      nick: me.nick,
      credits: Number(me.credits),
      isNew: false,
      offers: me.offers ? me.offers.split(',').map(s => s.trim()).filter(Boolean) : [],
      wants: me.wants ? me.wants.split(',').map(s => s.trim()).filter(Boolean) : []
    };
  }

  // All subsequent actions require an existing university user
  const allUsers = rows(ss, 'Users');
  const me = allUsers.find(u => u.email.toLowerCase() === email);
  if (!me) {
    return { error: 'Please log in again' };
  }

  const slots = rows(ss, 'Slots');

  // 2. SEARCH SLOTS (FR-4)
  if (action === 'search') {
    const query = String(p.skill || '').toLowerCase().trim();
    const now = new Date();

    return slots.filter(s => {
      if (s.status !== 'open') return false;
      if (s.tutor.toLowerCase() === email) return false; // not my own

      // Future slots check
      try {
        const slotDate = slotInstant(s.date, s.time);
        if (!slotDate || slotDate <= now) return false;
      } catch (e) {
        return false;
      }

      // Skill filter
      if (query && !s.skill.toLowerCase().includes(query)) return false;

      return true;
    });
  }

  // 3. EDIT PROFILE OFFERS & WANTS (FR-2)
  if (action === 'profile') {
    const sh = ss.getSheetByName('Users');
    const v = sh.getDataRange().getValues();
    const cleanOffers = String(p.offers || '').trim();
    const cleanWants = String(p.wants || '').trim();
    const cleanNick = p.nick ? String(p.nick).trim() : me.nick;

    for (let i = 1; i < v.length; i++) {
      if (String(v[i][0]).toLowerCase() === email) {
        // Update nick (col 2), offers (col 3), wants (col 4)
        sh.getRange(i + 1, 2, 1, 3).setValues([[cleanNick, cleanOffers, cleanWants]]);
        return { ok: true, nick: cleanNick, offers: cleanOffers, wants: cleanWants };
      }
    }
    return { error: 'User row not found' };
  }

  // 4. PUBLISH A SLOT (FR-3)
  if (action === 'publish') {
    if (!p.skill || !p.date || !p.time || !p.place) {
      return { error: 'Missing required slot details (skill, date, time, place)' };
    }

    const start = slotInstant(p.date, p.time);
    if (!start || start <= new Date()) {
      return { error: 'Use a future campus date yyyy-MM-dd and time HH:mm' };
    }
    if (!String(p.skill).trim() || !permittedPlace(p.place)) {
      return { error: 'Sessions must be in public campus areas (library, labs, canteen) or online; never in private rooms.' };
    }

    const id = 'SL' + Utilities.getUuid();
    appendSlot(ss, [
      id,
      email,
      p.skill.trim(),
      p.date,
      p.time,
      p.place.trim(),
      'open',
      '',
      '',
      ''
    ]);
    return { ok: true, slotId: id };
  }

  // 5. BOOK A SLOT (FR-5)
  if (action === 'book') {
    if (!p.slot) return { error: 'Missing slot parameter' };

    // Available credits check: credits - pending bookings >= 1
    const pendingBookings = slots.filter(
      s => s.learner && s.learner.toLowerCase() === email && s.status === 'booked'
    ).length;

    const availableCredits = Number(me.credits) - pendingBookings;
    if (availableCredits < 1) {
      return { error: 'Not enough credits: teach a session to earn more' };
    }

    return setSlot(
      ss,
      p.slot,
      s => s.status === 'open' && s.tutor.toLowerCase() !== email && slotInstant(s.date, s.time) > new Date(),
      { status: 'booked', learner: email, tutorOk: '', learnerOk: '' }
    );
  }

  // 6. CANCEL A SLOT (FR-6)
  if (action === 'cancel') {
    if (!p.slot) return { error: 'Missing slot parameter' };

    return setSlot(
      ss,
      p.slot,
      s => {
        if (s.status !== 'booked') return false;
        const isParticipant = (s.learner && s.learner.toLowerCase() === email) || (s.tutor.toLowerCase() === email);
        if (!isParticipant) return false;

        // Cancel allowed up to 2 hours before start (FR-6)
        const slotTime = slotInstant(s.date, s.time);
        if (!slotTime) return false;
        const diffMs = slotTime.getTime() - new Date().getTime();
        return diffMs >= 2 * 36e5; // inclusive two-hour boundary
      },
      { status: 'open', learner: '', tutorOk: '', learnerOk: '' }
    );
  }

  // 7. CONFIRM A SESSION (FR-7 with LockService & safe transfer)
  if (action === 'confirm') {
    if (!p.slot) return { error: 'Missing slot parameter' };
    return confirm(ss, p.slot, email);
  }

  // 8. RATE A COMPLETED SESSION (FR-8)
  if (action === 'rate') {
    if (!p.slot || !p.stars) return { error: 'Missing slot or stars parameter' };

    const targetSlot = slots.find(s => s.slotId === p.slot);
    if (!targetSlot) return { error: 'Unknown slot' };
    if (targetSlot.status !== 'done') return { error: 'Can only rate completed sessions' };

    const isParticipant =
      targetSlot.tutor.toLowerCase() === email ||
      (targetSlot.learner && targetSlot.learner.toLowerCase() === email);
    if (!isParticipant) return { error: 'Only session participants can rate' };

    const starsNum = Number(p.stars);
    if (!Number.isInteger(starsNum) || starsNum < 1 || starsNum > 5) {
      return { error: 'Stars must be a whole number from 1 to 5' };
    }
    if (rows(ss, 'Ratings').some(r => r.slotId === p.slot && r.from.toLowerCase() === email)) {
      return { error: 'You have already rated this session' };
    }
    ss.getSheetByName('Ratings').appendRow([p.slot, email, starsNum, new Date()]);
    return { ok: true, stars: starsNum };
  }

  // 9. MINE (MY SESSIONS & BALANCE)
  if (action === 'mine') {
    const userSlots = slots.filter(
      s => s.tutor.toLowerCase() === email || (s.learner && s.learner.toLowerCase() === email)
    );
    return {
      credits: Number(me.credits),
      nick: me.nick,
      slots: userSlots
    };
  }

  // 10. REPORT MISCONDUCT (Academic integrity / safety)
  if (action === 'report') {
    if (!p.target || !p.reason) return { error: 'Missing report target or reason' };
    const reportId = 'REP' + Date.now();
    let reportSheet = ss.getSheetByName('Reports');
    if (!reportSheet) {
      reportSheet = ss.insertSheet('Reports');
      reportSheet.appendRow(['reportId', 'reportedBy', 'target', 'reason', 'time', 'status']);
    }
    reportSheet.appendRow([reportId, email, p.target, p.reason, new Date(), 'pending_review']);
    return { ok: true, reportId: reportId };
  }

  // 11. DASHBOARD ANALYTICS (Day 13 Looker Studio & In-App Metrics)
  if (action === 'dashboard') {
    const usersCount = allUsers.length;
    const slotsCount = slots.length;
    const completedCount = slots.filter(s => s.status === 'done').length;
    const bookedCount = slots.filter(s => s.status === 'booked').length;
    const openCount = slots.filter(s => s.status === 'open').length;

    // Skill counts from offers and slots
    const skillCounts = {};
    for (const s of slots) {
      const sk = s.skill;
      skillCounts[sk] = (skillCounts[sk] || 0) + 1;
    }

    return {
      usersCount,
      slotsCount,
      completedCount,
      bookedCount,
      openCount,
      popularSkills: Object.entries(skillCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([skill, count]) => ({ skill, count }))
    };
  }

  return { error: 'unknown action: ' + action };
}

/**
 * Atomic two-sided confirmation with LockService preventing race conditions
 */
function confirm(ss, slotId, email) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // Wait up to 10 seconds for concurrent lock

  try {
    const sh = ss.getSheetByName('Slots');
    const table = readSlotTable(ss);
    const h = table.headers;

    for (let i = 1; i <= table.slots.length; i++) {
      if (table.slots[i - 1].slotId === slotId) {
        const s = table.slots[i - 1];

        if (s.status !== 'booked') {
          return { error: 'Session is not in booked state' };
        }

        const col = email === s.tutor.toLowerCase()
          ? 'tutorOk'
          : (s.learner && email === s.learner.toLowerCase())
          ? 'learnerOk'
          : null;

        if (!col) return { error: 'Not your session' };

        const start = slotInstant(s.date, s.time);
        if (!start || start > new Date()) return { error: 'Confirm only after the session has started' };

        // Validate both accounts before recording either confirmation or transfer.
        const participants = rows(ss, 'Users');
        const learner = participants.find(u => u.email.toLowerCase() === s.learner.toLowerCase());
        const tutor = participants.find(u => u.email.toLowerCase() === s.tutor.toLowerCase());
        if (!learner || !tutor || !Number.isFinite(Number(learner.credits)) || Number(learner.credits) < 1 || !Number.isFinite(Number(tutor.credits))) {
          return { error: 'Invalid participant balance; ask the team to check the sheet' };
        }

        // Mark individual confirmation
        sh.getRange(i + 1, h.indexOf(col) + 1).setValue('yes');
        s[col] = 'yes';

        // Check if BOTH sides have confirmed
        if (s.tutorOk === 'yes' && s.learnerOk === 'yes') {
          // Flush confirmation writes before one atomic Sheets transaction.
          // If a batch fails, no balances/status/ledger change; retry is safe.
          SpreadsheetApp.flush();
          transferCredit(ss, sh, i, h, s);

          return { ok: true, transferred: true };
        }

        return { ok: true, transferred: false };
      }
    }

    return { error: 'Unknown slot' };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Atomic slot field update helper
 */
function setSlot(ss, id, allowed, fields) {
  const sh = ss.getSheetByName('Slots');
  const table = readSlotTable(ss);
  const h = table.headers;

  for (let i = 1; i <= table.slots.length; i++) {
    if (table.slots[i - 1].slotId === id) {
      const s = table.slots[i - 1];
      if (!allowed(s)) {
        return { error: 'Not possible now (taken, your own slot, or too late)' };
      }

      Object.keys(fields).forEach(k => {
        const colIdx = h.indexOf(k);
        if (colIdx >= 0) {
          sh.getRange(i + 1, colIdx + 1).setValue(fields[k]);
        }
      });

      return { ok: true };
    }
  }

  return { error: 'Unknown slot' };
}

// Campus local time is explicit, independent of execution-host timezone.
function slotInstant(date, time) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date)) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(String(time))) return null;
  const result = new Date(date + 'T' + time + ':00+05:30');
  const calendar = new Date(date + 'T00:00:00Z');
  if (isNaN(result.getTime()) || isNaN(calendar.getTime()) || calendar.toISOString().slice(0, 10) !== date) return null;
  return result;
}

function permittedPlace(place) {
  const text = String(place).trim().toLowerCase();
  if (/\b(hostel|private|bedroom|my room|home|residence)\b/.test(text)) return false;
  return /^(online\b|https:\/\/)/.test(text) || /\b(library|lab|labs|laboratory|canteen|foyer|seminar hall|amphitheatre|amphitheater)\b/.test(text);
}

function transferCredit(ss, slotSheet, slotRowIndex, headers, slot) {
  const usersSheet = ss.getSheetByName('Users');
  const users = usersSheet.getDataRange().getValues();
  const learnerIndex = users.findIndex((u, i) => i > 0 && String(u[0]).toLowerCase() === slot.learner.toLowerCase());
  const tutorIndex = users.findIndex((u, i) => i > 0 && String(u[0]).toLowerCase() === slot.tutor.toLowerCase());
  if (learnerIndex < 1 || tutorIndex < 1 || learnerIndex === tutorIndex) throw new Error('Invalid credit participants');
  const learnerCredits = Number(users[learnerIndex][4]);
  const tutorCredits = Number(users[tutorIndex][4]);
  if (!Number.isFinite(learnerCredits) || learnerCredits < 1 || !Number.isFinite(tutorCredits)) throw new Error('Invalid credit balance');
  const cell = (sheetId, row, col, value) => ({ updateCells: {
    range: { sheetId: sheetId, startRowIndex: row, endRowIndex: row + 1, startColumnIndex: col, endColumnIndex: col + 1 },
    rows: [{ values: [{ userEnteredValue: typeof value === 'number' ? { numberValue: value } : { stringValue: value } }] }],
    fields: 'userEnteredValue'
  } });
  Sheets.Spreadsheets.batchUpdate({ requests: [
    cell(usersSheet.getSheetId(), learnerIndex, 4, learnerCredits - 1),
    cell(usersSheet.getSheetId(), tutorIndex, 4, tutorCredits + 1),
    cell(slotSheet.getSheetId(), slotRowIndex, headers.indexOf('status'), 'done'),
    { appendCells: { sheetId: ss.getSheetByName('Ledger').getSheetId(), rows: [{ values: [new Date().toISOString(), slot.learner, slot.tutor, 1, slot.slotId].map(value => ({ userEnteredValue: typeof value === 'number' ? { numberValue: value } : { stringValue: value } })) }], fields: 'userEnteredValue' } }
  ] }, ss.getId());
}

