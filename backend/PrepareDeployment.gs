/** Non-destructive production setup. Never seeds users or resets balances. */
function prepareDeployment() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const schema = {
    Users: ['email', 'nick', 'offers', 'wants', 'credits'],
    Slots: ['slotId', 'tutor', 'skill', 'date', 'time', 'place', 'status', 'learner', 'tutorOk', 'learnerOk'],
    Ledger: ['time', 'from', 'to', 'credits', 'slotId'],
    Ratings: ['slotId', 'from', 'stars', 'time']
  };
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    // Check all existing headers before creating anything.
    Object.keys(schema).forEach(name => {
      const sheet = ss.getSheetByName(name);
      if (sheet && sheet.getLastRow() > 0) {
        const actual = sheet.getRange(1, 1, 1, schema[name].length).getDisplayValues()[0];
        if (JSON.stringify(actual) !== JSON.stringify(schema[name])) throw new Error('Header mismatch in ' + name + '; no rows were reset');
      }
    });
    Object.keys(schema).forEach(name => {
      const sheet = ss.getSheetByName(name) || ss.insertSheet(name);
      if (sheet.getLastRow() === 0) sheet.appendRow(schema[name]);
      sheet.setFrozenRows(1);
    });
    ss.getSheetByName('Slots').getRange('D:E').setNumberFormat('@');
    ss.setSpreadsheetTimeZone('Asia/Kolkata');
    console.log('Ready: ' + ss.getUrl() + '. No sample data was inserted.');
  } finally {
    lock.releaseLock();
  }
}
