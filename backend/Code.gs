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

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  try {
    const result = route(ss, p);
    return out(p.action, result);
  } catch (err) {
    return out(p.action, { error: String(err.message || err) });
  }
}

/**
 * Read all rows of a sheet tab as an array of JavaScript objects
 */
function rows(ss, tab) {
  const sheet = ss.getSheetByName(tab);
  if (!sheet) return [];
  const v = sheet.getDataRange().getDisplayValues();
  if (!v || v.length <= 1) return [];
  const h = v.shift();
  return v.map(r => Object.fromEntries(h.map((k, i) => [k, r[i]])));
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
    if (!email.endsWith('@uohyd.ac.in')) {
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
        const slotDate = new Date(s.date + 'T' + s.time);
        if (isNaN(slotDate.getTime()) || slotDate <= now) return false;
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

    // Safety validation: Sessions in public campus places or online only
    const placeLower = String(p.place).toLowerCase();
    if (placeLower.includes('hostel room') || placeLower.includes('my room')) {
      return { error: 'Sessions must be in public campus areas (library, labs, canteen) or online; never in private rooms.' };
    }

    const id = 'SL' + Date.now();
    ss.getSheetByName('Slots').appendRow([
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
      s => s.status === 'open' && s.tutor.toLowerCase() !== email,
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
        const slotTime = new Date(s.date + 'T' + s.time);
        const diffMs = slotTime.getTime() - new Date().getTime();
        return diffMs > 2 * 36e5; // 2 hours in ms
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

    const starsNum = Math.min(5, Math.max(1, Math.round(Number(p.stars))));
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
    const v = sh.getDataRange().getDisplayValues();
    const h = v[0];

    for (let i = 1; i < v.length; i++) {
      if (v[i][0] === slotId) {
        const s = Object.fromEntries(h.map((k, j) => [k, v[i][j]]));

        if (s.status !== 'booked') {
          return { error: 'Session is not in booked state' };
        }

        const col = email === s.tutor.toLowerCase()
          ? 'tutorOk'
          : (s.learner && email === s.learner.toLowerCase())
          ? 'learnerOk'
          : null;

        if (!col) return { error: 'Not your session' };

        // Mark individual confirmation
        sh.getRange(i + 1, h.indexOf(col) + 1).setValue('yes');
        s[col] = 'yes';

        // Check if BOTH sides have confirmed
        if (s.tutorOk === 'yes' && s.learnerOk === 'yes') {
          // Transition state to 'done'
          sh.getRange(i + 1, h.indexOf('status') + 1).setValue('done');

          // Move 1 time credit from learner to tutor
          addCredits(ss, s.learner, -1);
          addCredits(ss, s.tutor, 1);

          // Append immutable ledger transaction
          ss.getSheetByName('Ledger').appendRow([
            new Date(),
            s.learner,
            s.tutor,
            1,
            slotId
          ]);

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
  const v = sh.getDataRange().getDisplayValues();
  const h = v[0];

  for (let i = 1; i < v.length; i++) {
    if (v[i][0] === id) {
      const s = Object.fromEntries(h.map((k, j) => [k, v[i][j]]));
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

/**
 * Safely adjusts credit balance for a student in the Users table
 */
function addCredits(ss, emailToUpdate, n) {
  const sh = ss.getSheetByName('Users');
  const v = sh.getDataRange().getValues();
  const targetEmail = String(emailToUpdate).toLowerCase();

  for (let i = 1; i < v.length; i++) {
    if (String(v[i][0]).toLowerCase() === targetEmail) {
      const current = Number(v[i][4]) || 0;
      const updated = Math.max(0, current + n);
      sh.getRange(i + 1, 5).setValue(updated);
      return;
    }
  }
}

