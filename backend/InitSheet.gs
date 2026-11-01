/**
 * ============================================================================
 * SKILLSWAP UoH - SPREADSHEET INITIALIZATION & SEED SCRIPT (R4)
 * Course: IE209 Skill Development Mini-Project
 * School of Computer and Information Sciences (SCIS), University of Hyderabad
 * ============================================================================
 *
 * HOW TO RUN:
 * 1. Open Google Sheets -> Extensions -> Apps Script
 * 2. Paste this file alongside Code.gs
 * 3. In the toolbar function dropdown, select `setupDatabase()`
 * 4. Click 'Run' and grant required spreadsheet permissions.
 *
 * It creates all 4 required tabs with exact column headers and realistic seed
 * data matching the 20 tutors and 15 slots requirement (Day 4 Checkpoint).
 */

function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. SETUP USERS TAB
  // Columns: email | nick | offers | wants | credits
  let usersSheet = ss.getSheetByName('Users');
  if (!usersSheet) {
    usersSheet = ss.insertSheet('Users');
  } else {
    usersSheet.clear();
  }
  usersSheet.appendRow(['email', 'nick', 'offers', 'wants', 'credits']);
  usersSheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#4f46e5').setFontColor('#ffffff');

  // Seed 20 campus students/tutors with realistic UoH academic profiles
  const initialUsers = [
    ['ravi.23mcse01@uohyd.ac.in', 'Ravi Teja', 'Python, LaTeX, Git, Data Structures', 'Figma, Spoken English, React', 2],
    ['sneha.des@uohyd.ac.in', 'Sneha Rao', 'Figma, UI/UX Design, Poster Design', 'Python, LaTeX, Docker', 3],
    ['priya.ling@uohyd.ac.in', 'Priya Sharma', 'Spoken English, Academic Writing, Phonetics', 'Excel, Python, SPSS', 4],
    ['amit.stat@uohyd.ac.in', 'Amit Kumar', 'Excel, R Programming, Statistics, Hypothesis Testing', 'Machine Learning, LaTeX', 1],
    ['rohit.scis@uohyd.ac.in', 'Rohit V', 'C++, Competitive Programming, Algorithms', 'Web Development, Figma', 2],
    ['kavya.ai@uohyd.ac.in', 'Kavya M', 'Machine Learning, PyTorch, Deep Learning', 'Linux, Docker', 3],
    ['arjun.math@uohyd.ac.in', 'Arjun N', 'Linear Algebra, LaTeX, Calculus', 'Python, Data Visualization', 2],
    ['divya.comm@uohyd.ac.in', 'Divya K', 'Public Speaking, Interview Prep, Resume Writing', 'Tableau, Excel', 3],
    ['vikram.sys@uohyd.ac.in', 'Vikram S', 'Linux Command Line, Bash Scripting, Docker', 'Cloud Computing, Golang', 2],
    ['ananya.web@uohyd.ac.in', 'Ananya P', 'React.js, Tailwind CSS, Frontend Development', 'Node.js, GraphQL', 2],
    ['manoj.db@uohyd.ac.in', 'Manoj R', 'SQL, Database Indexing, PostgreSQL', 'Data Warehousing, Python', 2],
    ['meera.chem@uohyd.ac.in', 'Meera T', 'Scientific Writing, Overleaf, ChemDraw', 'Data Analysis, R', 2],
    ['karthik.net@uohyd.ac.in', 'Karthik B', 'Computer Networks, Wireshark, Socket Programming', 'Cybersecurity, Linux', 2],
    ['pooja.lang@uohyd.ac.in', 'Pooja G', 'French for Beginners, Conversational Practice', 'Academic Writing, LaTeX', 2],
    ['siddharth.bio@uohyd.ac.in', 'Siddharth D', 'Bioinformatics, BLAST, Python Biopython', 'R, Machine Learning', 2],
    ['swati.nlp@uohyd.ac.in', 'Swati V', 'NLP, Transformers, HuggingFace', 'PyTorch, Docker', 3],
    ['harish.app@uohyd.ac.in', 'Harish E', 'App Inventor, Mobile UI, Android Basics', 'Flutter, Firebase', 2],
    ['pallavi.lit@uohyd.ac.in', 'Pallavi C', 'Creative Writing, Research Methodology, Proofreading', 'Excel, WordPress', 2],
    ['chetan.iot@uohyd.ac.in', 'Chetan K', 'Arduino, Microcontrollers, Embedded C', 'PCB Design, Python', 2],
    ['nandini.econ@uohyd.ac.in', 'Nandini S', 'Econometrics, Stata, Microeconomics', 'Excel, R', 2]
  ];

  initialUsers.forEach(u => usersSheet.appendRow(u));

  // 2. SETUP SLOTS TAB
  // Columns: slotId | tutor | skill | date | time | place | status | learner | tutorOk | learnerOk
  let slotsSheet = ss.getSheetByName('Slots');
  if (!slotsSheet) {
    slotsSheet = ss.insertSheet('Slots');
  } else {
    slotsSheet.clear();
  }
  slotsSheet.appendRow(['slotId', 'tutor', 'skill', 'date', 'time', 'place', 'status', 'learner', 'tutorOk', 'learnerOk']);
  slotsSheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#4f46e5').setFontColor('#ffffff');

  // Format date and time columns as Plain Text per section 5B
  slotsSheet.getRange('D:E').setNumberFormat('@');

  // Helper date generators for 15 slots over the next 2 weeks
  const today = new Date();
  function addDays(d, n) {
    const res = new Date(d);
    res.setDate(res.getDate() + n);
    return res.toISOString().split('T')[0];
  }

  const initialSlots = [
    // Open future slots
    ['SL101', 'sneha.des@uohyd.ac.in', 'Figma Auto-Layout & UI Components', addDays(today, 1), '15:00', 'SCIS Lab 1', 'open', '', '', ''],
    ['SL102', 'priya.ling@uohyd.ac.in', 'Spoken English & Campus Interview Prep', addDays(today, 2), '16:00', 'Indira Gandhi Memorial Library (Ground Floor Discussion Area)', 'open', '', '', ''],
    ['SL103', 'amit.stat@uohyd.ac.in', 'Excel Advanced: VLOOKUP, INDEX-MATCH & Pivot Tables', addDays(today, 3), '14:30', 'CIS Lab 2', 'open', '', '', ''],
    ['SL104', 'vikram.sys@uohyd.ac.in', 'Linux Command Line Mastery & Bash Automation', addDays(today, 4), '17:00', 'SCIS Ground Floor Foyer', 'open', '', '', ''],
    ['SL105', 'ananya.web@uohyd.ac.in', 'Modern React Hooks: useState, useEffect & Custom Hooks', addDays(today, 5), '11:00', 'Online - Google Meet', 'open', '', '', ''],
    ['SL106', 'arjun.math@uohyd.ac.in', 'Linear Algebra for Machine Learning: Eigenvalues & SVD', addDays(today, 6), '15:30', 'Maths Dept Seminar Hall', 'open', '', '', ''],
    ['SL107', 'kavya.ai@uohyd.ac.in', 'PyTorch Tensors, Autograd & Building Your First CNN', addDays(today, 7), '14:00', 'SCIS Lab 3', 'open', '', '', ''],
    ['SL108', 'divya.comm@uohyd.ac.in', 'Overcoming Stage Fright & Confident Seminar Presentations', addDays(today, 8), '16:30', 'Campus Amphitheatre / Library Lounge', 'open', '', '', ''],
    ['SL109', 'manoj.db@uohyd.ac.in', 'PostgreSQL Query Optimization & Explain Plan', addDays(today, 9), '10:00', 'SCIS Lab 2', 'open', '', '', ''],
    ['SL110', 'pooja.lang@uohyd.ac.in', 'Conversational French for Beginners', addDays(today, 10), '17:30', 'Library Discussion Room 2', 'open', '', '', ''],

    // Active booked slots
    ['SL111', 'ravi.23mcse01@uohyd.ac.in', 'LaTeX Masterclass: Thesis & Report Typesetting', addDays(today, 1), '17:00', 'Indira Gandhi Memorial Library (Ground Floor Discussion Area)', 'booked', 'priya.ling@uohyd.ac.in', '', ''],
    ['SL112', 'sneha.des@uohyd.ac.in', 'Design Systems & Color Accessibility', addDays(today, 3), '11:00', 'CIS Lab 1', 'booked', 'ravi.23mcse01@uohyd.ac.in', '', ''],

    // Completed slots with confirmed status
    ['SL113', 'ravi.23mcse01@uohyd.ac.in', 'Python Fundamentals & Data Structures', addDays(today, -3), '14:00', 'SCIS Lab 1', 'done', 'amit.stat@uohyd.ac.in', 'yes', 'yes'],
    ['SL114', 'priya.ling@uohyd.ac.in', 'Academic Writing & Avoiding Plagiarism', addDays(today, -4), '16:00', 'Library Discussion Room 1', 'done', 'ravi.23mcse01@uohyd.ac.in', 'yes', 'yes'],
    ['SL115', 'amit.stat@uohyd.ac.in', 'Data Cleaning with Pandas & Excel', addDays(today, -5), '10:30', 'CIS Lab 2', 'done', 'sneha.des@uohyd.ac.in', 'yes', 'yes']
  ];

  initialSlots.forEach(s => slotsSheet.appendRow(s));

  // 3. SETUP LEDGER TAB
  // Columns: time | from | to | credits | slotId
  let ledgerSheet = ss.getSheetByName('Ledger');
  if (!ledgerSheet) {
    ledgerSheet = ss.insertSheet('Ledger');
  } else {
    ledgerSheet.clear();
  }
  ledgerSheet.appendRow(['time', 'from', 'to', 'credits', 'slotId']);
  ledgerSheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#4f46e5').setFontColor('#ffffff');

  // Seed confirmed historical ledger transactions
  const initialLedger = [
    [new Date(today.getTime() - 3 * 864e5).toISOString().replace('T', ' ').substring(0, 16), 'amit.stat@uohyd.ac.in', 'ravi.23mcse01@uohyd.ac.in', 1, 'SL113'],
    [new Date(today.getTime() - 4 * 864e5).toISOString().replace('T', ' ').substring(0, 16), 'ravi.23mcse01@uohyd.ac.in', 'priya.ling@uohyd.ac.in', 1, 'SL114'],
    [new Date(today.getTime() - 5 * 864e5).toISOString().replace('T', ' ').substring(0, 16), 'sneha.des@uohyd.ac.in', 'amit.stat@uohyd.ac.in', 1, 'SL115']
  ];

  initialLedger.forEach(l => ledgerSheet.appendRow(l));

  // 4. SETUP RATINGS TAB
  // Columns: slotId | from | stars | time
  let ratingsSheet = ss.getSheetByName('Ratings');
  if (!ratingsSheet) {
    ratingsSheet = ss.insertSheet('Ratings');
  } else {
    ratingsSheet.clear();
  }
  ratingsSheet.appendRow(['slotId', 'from', 'stars', 'time']);
  ratingsSheet.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#4f46e5').setFontColor('#ffffff');

  // Seed sample verified ratings
  const initialRatings = [
    ['SL113', 'amit.stat@uohyd.ac.in', 5, new Date(today.getTime() - 3 * 864e5)],
    ['SL114', 'ravi.23mcse01@uohyd.ac.in', 5, new Date(today.getTime() - 4 * 864e5)],
    ['SL115', 'sneha.des@uohyd.ac.in', 4, new Date(today.getTime() - 5 * 864e5)]
  ];

  initialRatings.forEach(r => ratingsSheet.appendRow(r));

  // 5. SETUP REPORTS TAB (MISCONDUCT & SAFETY)
  let reportsSheet = ss.getSheetByName('Reports');
  if (!reportsSheet) {
    reportsSheet = ss.insertSheet('Reports');
  } else {
    reportsSheet.clear();
  }
  reportsSheet.appendRow(['reportId', 'reportedBy', 'target', 'reason', 'time', 'status']);
  reportsSheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#dc2626').setFontColor('#ffffff');

  // Auto-resize columns for readability
  [usersSheet, slotsSheet, ledgerSheet, ratingsSheet, reportsSheet].forEach(sh => {
    sh.autoResizeColumns(1, 10);
  });

  Logger.log('SkillSwap Database setup successfully completed with 20 tutors, 15 slots, ledger & ratings!');
}
