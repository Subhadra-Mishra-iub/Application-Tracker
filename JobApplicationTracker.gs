/*******************************
 * Job Application Tracker (Gmail → Google Sheets)
 * Scans label "Job Search", appends rows, dedups, parses Company/Role,
 * and maintains a Daily Summary (Applications & Rejections per date).
 *******************************/

// ==== CONFIG ====
const CONFIG = {
  SHEET_NAME: 'Applications',        // Main sheet name
  PROCESSED_SHEET: 'Processed',      // Hidden sheet for processed MessageIds
  SUMMARY_SHEET: 'Daily Summary',    // Summary sheet name
  LOOKBACK_DAYS: 7,                  // Backfill window for manual runs
  LABEL: 'Job Search',               // Gmail label to filter job emails (must exist)
  BASE_QUERY:
    '("thank you for applying" OR "application received" OR subject:applied OR ' +
    'subject:"your application" OR subject:rejected OR subject:interview OR ' +
    'subject:"next steps" OR subject:"assessment" OR subject:"shortlisted")'
};

// ==== HEADERS ====
const HEADERS = [
  'Date', 'Company', 'Role', 'Status', 'Subject', 'From', 'ThreadId', 'MessageId', 'Link'
];

// ==== SUMMARY HEADERS ====
const SUMMARY_HEADERS = ['Date', 'Applications', 'Rejections', 'Last Updated'];

/** Entry point: fetch threads/messages, dedup, append rows, then update summary */
function updateJobTracker() {
  const ss = SpreadsheetApp.getActive();
  const sheet = ensureMainSheet_(ss);
  const procSheet = ensureProcessedSheet_(ss);

  const processed = getProcessedIds_(procSheet);
  const now = new Date();
  const since = new Date(now.getTime() - CONFIG.LOOKBACK_DAYS * 24 * 60 * 60 * 1000);

  const query = buildQuery_(since);
  const threads = fetchAllThreads_(query, 500); // cap for safety

  const rowsToAppend = [];

  threads.forEach(thread => {
    const messages = thread.getMessages();
    messages.forEach(msg => {
      const msgId = msg.getId();
      if (processed.has(msgId)) return;      // skip already-logged messages

      const date = msg.getDate();
      if (date < since) return;              // extra guard

      const subject = msg.getSubject() || '';
      const from = msg.getFrom() || '';
      const parsed = parseSubject_(subject, from); // smarter parser

      rowsToAppend.push([
        formatDate_(date),
        parsed.company,
        parsed.role,
        parsed.status,
        subject,
        from,
        thread.getId(),
        msgId,
        'https://mail.google.com/mail/u/0/#inbox/' + thread.getId()
      ]);

      processed.add(msgId);
    });
  });

  if (rowsToAppend.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rowsToAppend.length, HEADERS.length)
         .setValues(rowsToAppend);
    appendProcessedIds_(procSheet, rowsToAppend.map(r => r[7])); // MessageId column index 7
  }

  // Always refresh the summary after logging
  updateDailySummary();
}

/** One-time: create/replace a daily trigger at chosen hour (0–23) */
function createDailyTrigger() {
  deleteAllTriggers_();
  ScriptApp.newTrigger('updateJobTracker')
    .timeBased()
    .everyDays(1)
    .atHour(9)     // ← change to 10, 11, etc. if you prefer
    .create();
}

/** Optional: easy menu inside the Sheet */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Job Tracker')
    .addItem('Run Now', 'updateJobTracker')
    .addItem('Recreate Daily Trigger', 'createDailyTrigger')
    .addItem('Enrich Existing Rows (fill Company/Role)', 'enrichExistingRows')
    .addItem('Update Daily Summary', 'updateDailySummary')
    .addToUi();
}

/** Manual backfill run (uses LOOKBACK_DAYS) */
function runOnce() {
  updateJobTracker();
}

// ==== HELPERS (sheets/trigger) ====

function deleteAllTriggers_() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
}

function ensureMainSheet_(ss) {
  let sh = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sh) sh = ss.insertSheet(CONFIG.SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function ensureProcessedSheet_(ss) {
  let sh = ss.getSheetByName(CONFIG.PROCESSED_SHEET);
  if (!sh) {
    sh = ss.insertSheet(CONFIG.PROCESSED_SHEET);
    sh.hideSheet();
    sh.getRange(1, 1).setValue('MessageId');
  } else if (sh.getLastRow() === 0) {
    sh.getRange(1, 1).setValue('MessageId');
  }
  return sh;
}

function ensureSummarySheet_(ss) {
  let sh = ss.getSheetByName(CONFIG.SUMMARY_SHEET);
  if (!sh) {
    sh = ss.insertSheet(CONFIG.SUMMARY_SHEET);
    sh.getRange(1, 1, 1, SUMMARY_HEADERS.length).setValues([SUMMARY_HEADERS]);
    sh.setFrozenRows(1);
  } else if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, SUMMARY_HEADERS.length).setValues([SUMMARY_HEADERS]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function getProcessedIds_(sh) {
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return new Set();
  const values = sh.getRange(2, 1, lastRow - 1, 1).getValues().flat();
  return new Set(values.filter(Boolean));
}

function appendProcessedIds_(sh, ids) {
  if (!ids.length) return;
  const rows = ids.map(id => [id]);
  sh.getRange(sh.getLastRow() + 1, 1, rows.length, 1).setValues(rows);
}

function buildQuery_(sinceDate) {
  const days = Math.max(1, CONFIG.LOOKBACK_DAYS);
  // label:"Job Search" with quotes to handle the space
  return `${CONFIG.BASE_QUERY} label:"${CONFIG.LABEL}" newer_than:${days}d`;
}

function fetchAllThreads_(query, maxThreads) {
  const out = [];
  let start = 0;
  const pageSize = 100;
  while (true) {
    const threads = GmailApp.search(query, start, pageSize);
    if (!threads.length) break;
    out.push(...threads);
    start += pageSize;
    if (out.length >= maxThreads) break;
  }
  return out;
}

function formatDate_(d) {
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

// ==== SMART PARSER (Company/Role/Status) ====

// Parse status + best-effort Company/Role
function parseSubject_(s, from) {
  const subj = s || '';

  const status =
    /reject|declin|unsuccessful|no longer under consideration/i.test(subj) ? 'Rejected' :
    /interview|schedule|next step|phone screen|assessment|coding test|hackerank|codility/i.test(subj) ? 'Interview/Next Step' :
    /apply|application|received|thank you for applying|we received your/i.test(subj) ? 'Applied/Auto-ack' :
    'Other';

  const role = extractRoleFromSubject_(subj);
  let company = extractCompanyFromSubject_(subj);
  if (!company) company = extractCompanyFromFrom_(from);

  return { company, role, status };
}

// Try to capture role phrases like "… application for <Role> at …"
function extractRoleFromSubject_(subj) {
  const patterns = [
    /(?:application|applied|consideration|interview|assessment|screen(?:ing)?|invite|schedule|offer)\s*(?:for|to)?\s*(?:the\s*)?(?:position|role|job)?\s*[""]?(.+?)[""]?(?:\s+(?:at|with|in)\s+|$)/i,
    /(?:for|as)\s+[""]?(.+?)[""]?(?:\s+(?:at|with|in)\s+|$)/i,
    /position[:\s-]+[""]?(.+?)[""]?(?:\s+(?:at|with|in)\s+|$)/i,
    /role[:\s-]+[""]?(.+?)[""]?(?:\s+(?:at|with|in)\s+|$)/i
  ];
  for (const p of patterns) {
    const m = subj.match(p);
    if (m && m[1]) return m[1].trim().replace(/[–—|].*$/, '').slice(0, 120);
  }
  return '';
}

// Company from subject (multiple real-world patterns)
function extractCompanyFromSubject_(subj) {
  if (!subj) return '';
  const s = subj.trim();

  const patterns = [
    // 1) "Your application to Company", "Thank you for applying to Company"
    /(?:your\s+application|application|applied|thank you for applying|update)\s+(?:to|with)\s+([A-Za-z0-9&.,'()\- ]{2,80})/i,

    // 2) "... at Company", "... with Company"
    /(?:at|with)\s+([A-Za-z0-9&.,'()\- ]{2,80})(?=$|[\-–—:|]| for | regarding | position | role | opportunity)/i,

    // 3) "[Company] …", "Company — …", "Company: …", "Company | …"
    /^\s*\[?\s*([A-Za-z0-9&.,'()\- ]{2,80})\s*\]?\s*[-–—:|]/,

    // 4) "Careers at Company", "Recruiting at Company"
    /(Careers|Recruiting|Talent(?:\s+Acquisition)?)\s+(?:at|with)\s+([A-Za-z0-9&.,'()\- ]{2,80})/i,

    // 5) "Application Update - Company", "Interview Scheduled: Company"
    /(?:application|candidate|interview|job)\s+(?:update|receipt|confirmation|scheduled|status)\s*[-–—:|]\s*([A-Za-z0-9&.,'()\- ]{2,80})/i
  ];

  for (const p of patterns) {
    const m = s.match(p);
    if (!m) continue;
    const raw = m[m.length - 1];           // last capturing group = company
    const cleaned = cleanCompany_(raw);
    if (cleaned && !isVendorATS_(cleaned)) return cleaned;
  }
  return '';
}

// Fallback: from the display name or the email domain
function extractCompanyFromFrom_(fromStr) {
  if (!fromStr) return '';
  let display = fromStr.split('<')[0].trim().replace(/["']/g, '');
  if (display && !/(do.?not.?reply|no.?reply|noreply|careers|jobs|hr|talent|notification|support|team|system|workday|greenhouse|lever|icims|bamboohr)/i.test(display)) {
    return cleanCompany_(display);
  }
  const emailMatch = fromStr.match(/<([^>]+)>/);
  let domain = emailMatch ? emailMatch[1].split('@')[1] : (fromStr.includes('@') ? fromStr.split('@')[1] : '');
  domain = (domain || '').split('.')[0].replace(/[-_]/g, ' ');
  return titleCase_(domain);
}

function cleanCompany_(name) {
  return titleCase_(
    (name || '')
      .replace(/^[\s"'[\]()]+|[\s"'[\]()]+$/g, '')                                  // strip quotes/brackets
      .replace(/\s+(careers|recruiting|talent(?:\s+acquisition)?|notifications?|support|team)$/i, '') // trailing dept words
      .trim()
  );
}

// Ignore common ATS/platforms when they look like a company
function isVendorATS_(name) {
  return /(Workday|Greenhouse|Lever|iCIMS|BambooHR|SuccessFactors|SmartRecruiters|Taleo|Ashby|Jobvite|Oracle\s*Cloud|SAP\s*SuccessFactors)/i.test(name || '');
}

function titleCase_(str) {
  return (str || '')
    .split(/\s+/)
    .map(w => w.length <= 3 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
    .replace(/\bIi\b/, 'II');
}

// ==== SUMMARY (Applications/Rejections per date) ====

function updateDailySummary() {
  const ss = SpreadsheetApp.getActive();
  const appSh = ensureMainSheet_(ss);
  const sumSh = ensureSummarySheet_(ss);

  const lastRow = appSh.getLastRow();
  // Clear and rewrite headers
  sumSh.clearContents();
  sumSh.getRange(1, 1, 1, SUMMARY_HEADERS.length).setValues([SUMMARY_HEADERS]);
  sumSh.setFrozenRows(1);

  if (lastRow < 2) return; // nothing to summarize

  // Read App sheet: Date (col 1), Status (col 4)
  const data = appSh.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  const counts = {}; // { 'YYYY-MM-DD': { apps: n, rejects: n } }

  data.forEach(row => {
    const dateStr = row[0];     // formatted yyyy-MM-dd
    const status  = (row[3] || '').toString();
    if (!dateStr) return;

    if (!counts[dateStr]) counts[dateStr] = { apps: 0, rejects: 0 };

    if (/^Applied\/Auto-ack$/i.test(status)) {
      counts[dateStr].apps++;
    } else if (/^Rejected$/i.test(status)) {
      counts[dateStr].rejects++;
    }
  });

  // Sort by date ascending
  const dates = Object.keys(counts).sort();
  const ts = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');

  const rows = dates.map(d => [d, counts[d].apps, counts[d].rejects, ts]);

  if (rows.length) {
    sumSh.getRange(2, 1, rows.length, SUMMARY_HEADERS.length).setValues(rows);
  }
}

// ==== UTIL: enrich existing blank Company/Role for already-logged rows ====
function enrichExistingRows() {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sh) return;
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return;

  const rng = sh.getRange(2, 1, lastRow - 1, HEADERS.length);
  const data = rng.getValues();
  let updated = 0;

  for (let i = 0; i < data.length; i++) {
    const company = data[i][1], role = data[i][2];
    const subject = data[i][4], from = data[i][5];
    if (!company || !role) {
      const parsed = parseSubject_(subject, from);
      if (!company) data[i][1] = parsed.company;
      if (!role) data[i][2] = parsed.role;
      updated++;
    }
  }
  rng.setValues(data);
  Logger.log('Updated rows: ' + updated);
}
