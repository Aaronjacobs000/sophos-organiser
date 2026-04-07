/* ============================================================
   Sophos Personal Organiser — Application Logic
   Aligned to ANZ Field "Day in the Life" Handbook v1.2
   ============================================================ */

const STORAGE_KEY = 'sophos-organiser-data';
const SCHEMA_VERSION = 5;

// --- Categories ---
const CATEGORIES = {
  customerMeetings:    { label: 'Customer Meetings',     color: '#5A00FF' },
  partnerEngagement:   { label: 'Partner Engagement',     color: '#00F2B3' },
  prospecting:         { label: 'Prospecting',            color: '#2006F7' },
  pipelineForecasting: { label: 'Pipeline & Forecasting', color: '#009CFB' },
  territoryPlanning:   { label: 'Territory Planning',     color: '#F29400' },
  enablementAdmin:     { label: 'Enablement / Admin',     color: '#6A889B' },
};
const CATEGORY_KEYS = Object.keys(CATEGORIES);

// --- Priority Levels ---
const PRIORITIES = {
  urgent: { label: 'Urgent', color: '#EA0022', sort: 0 },
  high:   { label: 'High',   color: '#F29400', sort: 1 },
  medium: { label: 'Medium', color: '#009CFB', sort: 2 },
  low:    { label: 'Low',    color: '#6A889B', sort: 3 },
};

// --- Recurrence ---
const RECURRENCE_OPTIONS = {
  none:    { label: 'No repeat' },
  daily:   { label: 'Daily' },
  weekly:  { label: 'Weekly' },
  fortnightly: { label: 'Fortnightly' },
  monthly: { label: 'Monthly' },
  annual:  { label: 'Annual' },
  custom:  { label: 'Custom (days)' },
};

// --- Opportunity Types ---
const OPP_TYPES = {
  newLogo:   { label: 'New Logo',   color: '#00F2B3' },
  expansion: { label: 'Expansion',  color: '#009CFB' },
  renewal:   { label: 'Renewal',    color: '#6A889B' },
};
const OPP_STAGES = [
  'Prospecting', 'Discovery / Qualification', 'Technical Validation',
  'Proposal / Quote', 'Negotiation', 'Closed Won', 'Closed Lost',
];

// --- Issue Types ---
const ISSUE_TYPES = {
  supportCase:       { label: 'Support Case',       icon: 'headset' },
  customerPainPoint: { label: 'Customer Pain Point', icon: 'alert-triangle' },
  escalation:        { label: 'Escalation',          icon: 'arrow-up-circle' },
  other:             { label: 'Other',               icon: 'circle' },
};

// --- Weekly Cadence (defaults — copied to settings on first run, user can customize) ---
const DAY_ABBREVS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const CADENCE_FREQUENCIES = {
  weekly: { label: 'Weekly' },
  fortnightly: { label: 'Fortnightly' },
  monthly: { label: 'Monthly' },
};

// --- Role Templates ---
const CADENCE_TEMPLATES = {
  tae: {
    label: 'Sales Executive (TAE)',
    description: 'Territory Account Executive cadence from the ANZ Day-in-the-Life Handbook',
    items: [
      { id: 'se-standup',      label: 'SE Weekly Action Plan',           duration: '30min', day: 'Mon', frequency: 'weekly', description: 'Review prior actions, align SE activities, solution map priorities' },
      { id: 'p-matrix',        label: 'P-Matrix Activity Plan',          duration: '30min', day: 'Mon', frequency: 'weekly', description: 'Review P-Matrix accounts, plan engagement & resources, expansion discovery' },
      { id: 'focus-30',        label: 'Focus 30 Expansion Review',       duration: '30min', day: 'Mon', frequency: 'weekly', description: 'Review Focus 30 list, targeted sales plays, research customers' },
      { id: 'territory-review',label: 'Territory Plan Review',           duration: '30min', day: 'Mon', frequency: 'weekly', description: 'P-Matrix progress, Focus 30 progress, NB initiatives, adjust plan' },
      { id: 'deal-reg',        label: 'Deal Reg Call Downs',             duration: '30min', day: 'Tue', frequency: 'weekly', description: 'Review & follow up on deal registrations, BANT qualify, partner alignment' },
      { id: 'coat-tailing',    label: 'Coat Tailing Research',           duration: '30min', day: 'Tue', frequency: 'weekly', description: 'LinkedIn cross-reference, track customer contact movements, outreach list' },
      { id: 'prospecting',     label: 'New Logo Prospecting',            duration: '60min', day: 'Wed', frequency: 'weekly', description: 'Market research, customer references, PBI whitespace, partner prospecting' },
      { id: 'sdr-calldowns',   label: 'SDR / Mktg Follow-up',           duration: '30min', day: 'Thu', frequency: 'weekly', description: 'Review SDR leads (within 48hrs), Clari dashboard, outbound campaign alignment' },
      { id: 'forecast-prep',   label: 'Forecast Prep & Deal Updates',    duration: '30min', day: 'Fri', frequency: 'weekly', description: 'Submit Clari forecast (Wed CoB), top 15 deal updates, MEDDPICC review for +$30K' },
      { id: 'renewal-cadence', label: 'Renewal Cadence',                 duration: '30min', day: 'Mon', frequency: 'fortnightly', description: 'Cross-sell accounts from ATR, highlight at-risk, RAM vs TAE alignment' },
      { id: 'csm-cadence',     label: 'CSM Cadence',                     duration: '30min', day: 'Fri', frequency: 'fortnightly', description: 'Review CSM-led activity, account feedback, actions for review' },
      { id: 'channel-cadence', label: 'Channel Cadence / Adopt a Rep',   duration: '30min', day: 'Wed', frequency: 'fortnightly', description: 'Managed partner activity, sponsor-a-rep review, joint engagement opps' },
      { id: 'deal-review',     label: 'Week 2/8 Deal Review',            duration: '30min', day: 'Mon', frequency: 'monthly', description: 'Complete deal review template, identify key NB opps, steps to close' },
      { id: 'enablement',      label: 'Enablement',                      duration: '60min', day: 'Thu', frequency: 'monthly', description: 'Mindtickle training, compliance training, ad-hoc learning' },
      { id: 'month-review',    label: 'Month in Review',                 duration: '30min', day: 'Fri', frequency: 'monthly', description: 'Territory performance, wins/losses analysis, activity performance, share in GTM' },
    ],
  },
  se: {
    label: 'Sales Engineer (SE)',
    description: 'Sales Engineer cadence from the FY26 SE Day-in-the-Life framework',
    items: [
      // Daily rhythm (represented as weekly items on specific days)
      { id: 'se-dev-research',    label: 'Development / Research',          duration: '60min', day: 'Mon', frequency: 'weekly', description: 'Threat landscape, industry, competitive, cyber regulations, risk & compliance, LinkedIn learning, Mindtickle' },
      { id: 'se-cust-engage-1',   label: 'Customer / Partner Engagement',   duration: '3hrs',  day: 'Mon', frequency: 'weekly', description: 'Customer/partner influence, thought leadership, solution definition, SE-led evaluations, POC criteria, security checkups' },
      { id: 'se-cust-engage-2',   label: 'Customer / Partner Engagement',   duration: '3hrs',  day: 'Tue', frequency: 'weekly', description: 'Customer assessments, security checkups, delivered solution presentations, action follow-up on EWS/CAW alerts' },
      { id: 'se-cust-engage-3',   label: 'Customer / Partner Engagement',   duration: '3hrs',  day: 'Wed', frequency: 'weekly', description: 'Partner contact: delivered presentations, webinars, enablement in aligned territory' },
      { id: 'se-cust-engage-4',   label: 'Customer / Partner Engagement',   duration: '3hrs',  day: 'Thu', frequency: 'weekly', description: 'SE-led evaluations, POC criteria, customer assessments, respond to segment alerts' },
      { id: 'se-cust-engage-5',   label: 'Customer / Partner Engagement',   duration: '3hrs',  day: 'Fri', frequency: 'weekly', description: 'Customer/partner influence, solution definition, delivered solution presentations' },
      { id: 'se-sfdc-hygiene',    label: 'SFDC Hygiene',                    duration: '30min', day: 'Tue', frequency: 'weekly', description: 'Update opportunity/account, SE Engaged/PS-SE internal notes, SE milestones, add tasks/events/notes, security checkup & channel activity' },
      // Weekly SE-specific
      { id: 'se-team-call',       label: 'SE Team Call',                    duration: '60min', day: 'Mon', frequency: 'weekly', description: '1x 1hr SE Team Call, +20K opportunity review, technical development needs' },
      { id: 'se-milestone-review',label: 'SE Milestone Activities',         duration: '60min', day: 'Wed', frequency: 'weekly', description: '10x customer/partner SE milestone activities: demos, strategic account planning, escalations, resource discussions, review technical opp status' },
      { id: 'se-opp-review',      label: 'Top 20 Opportunity Review',      duration: '30min', day: 'Thu', frequency: 'weekly', description: 'Review technical opportunity status for top 20 opps in SFDC with SEM' },
      { id: 'se-rfx-responses',   label: 'RFx Responses',                  duration: '30min', day: 'Fri', frequency: 'weekly', description: 'Respond to qualified RFx requirements' },
      // Monthly SE items
      { id: 'se-1on1-sem',        label: '1:1 with SEM',                   duration: '60min', day: 'Mon', frequency: 'monthly', description: '2x 1hr 1:1 with SEM: personal development, coaching, Sophskills completion' },
      { id: 'se-monthly-bu',      label: 'Monthly BU / PM Calls',          duration: '30min', day: 'Thu', frequency: 'monthly', description: 'Attend all internal monthly BU/PM calls, refer to recordings within 7 days' },
      { id: 'se-partner-intimacy',label: 'Partner Intimacy',               duration: '60min', day: 'Wed', frequency: 'monthly', description: 'Connect with technical contacts in 10 aligned strategic partners, SE shadowing, partner POC/evaluation support, partner security checkups' },
      { id: 'se-p-matrix-update', label: 'P-Matrix Tech Status Update',    duration: '30min', day: 'Fri', frequency: 'monthly', description: 'P-Matrix tech status aligned & discussed with TAE, channel activities updated with CAE' },
      // Quarterly SE items (mapped as monthly — user can adjust)
      { id: 'se-security-checks', label: 'Security Checkups (Quarterly)',   duration: '60min', day: 'Tue', frequency: 'monthly', description: '9 SE-led security checkups per quarter with recommendations, 1 assessment per quarter (TT exercise, NIST, NIS2)' },
      { id: 'se-threat-profiles', label: 'Threat Profile Assessments',     duration: '60min', day: 'Wed', frequency: 'monthly', description: '10 threat profile assessments per quarter, solution map completion for priority opps (+$30K ACV)' },
    ],
  },
};

const DEFAULT_CADENCE_ITEMS = CADENCE_TEMPLATES.tae.items;

function getCadenceIds(items) { return items.map(i => i.id); }

const MEETING_TARGETS = { customerCQ: 7, customerNQ: 3, partner: 2 };

const MEDDPICC_FIELDS = [
  { key: 'metrics',          label: 'Metrics',           hint: 'Quantified value / business impact' },
  { key: 'economicBuyer',    label: 'Economic Buyer',    hint: 'Who signs off? Have you met them?' },
  { key: 'decisionCriteria', label: 'Decision Criteria',  hint: 'Technical & business requirements' },
  { key: 'decisionProcess',  label: 'Decision Process',   hint: 'Steps, timeline, stakeholders involved' },
  { key: 'paperProcess',     label: 'Paper Process',      hint: 'Procurement, legal, PO process' },
  { key: 'identifyPain',     label: 'Identify Pain',      hint: 'Confirmed pain points driving the deal' },
  { key: 'champion',         label: 'Champion',           hint: 'Internal advocate with power & influence' },
  { key: 'competition',      label: 'Competition',        hint: 'Competitors involved, their strengths/weaknesses' },
];

const DEFAULT_TARGETS = {
  customerMeetings: 35, partnerEngagement: 15, prospecting: 15,
  pipelineForecasting: 15, territoryPlanning: 10, enablementAdmin: 10,
};

// ===================== Utilities =====================
function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
}
function getToday() { return formatDate(new Date()); }
function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function getISOWeekKey(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}
function getISOWeekNumber(weekKey) { return parseInt(weekKey.split('-W')[1]); }
function getWeekDates(weekKey) {
  const [yearStr, weekStr] = weekKey.split('-W');
  const year = parseInt(yearStr), week = parseInt(weekStr);
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7;
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - dayOfWeek + 1 + (week - 1) * 7);
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday); d.setDate(monday.getDate() + i); dates.push(formatDate(d));
  }
  return dates;
}
function getWeekDisplayRange(weekKey) {
  const dates = getWeekDates(weekKey);
  const opts = { day: 'numeric', month: 'short' };
  return `${parseDate(dates[0]).toLocaleDateString('en-AU', opts)} – ${parseDate(dates[4]).toLocaleDateString('en-AU', opts)} ${parseDate(dates[0]).getFullYear()}`;
}
function getDayName(dateStr) { return parseDate(dateStr).toLocaleDateString('en-AU', { weekday: 'short' }); }
function getDayDate(dateStr) { return parseDate(dateStr).getDate(); }
function daysBetween(d1, d2) { return Math.round((parseDate(d2) - parseDate(d1)) / 86400000); }
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}
function formatTimestamp(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
}
function formatShortTimestamp(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) +
    ' ' + d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
}
function navigateWeek(key, delta) {
  const dates = getWeekDates(key);
  const monday = parseDate(dates[0]);
  monday.setDate(monday.getDate() + delta * 7);
  return getISOWeekKey(monday);
}
function isFortnightlyWeek(wk) { return getISOWeekNumber(wk) % 2 === 0; }
function isFirstWeekOfMonth(wk) { return parseDate(getWeekDates(wk)[0]).getDate() <= 7; }
function createEmptyMeddpicc() {
  const m = {}; MEDDPICC_FIELDS.forEach(f => m[f.key] = ''); return m;
}

// --- Natural language date extraction from todo titles ---
function extractDateFromTitle(title) {
  const today = new Date();
  const patterns = [
    { regex: /\b(today)\b/i, offset: 0 },
    { regex: /\b(tomorrow)\b/i, offset: 1 },
    { regex: /\b(day after tomorrow)\b/i, offset: 2 },
    { regex: /\b(next monday)\b/i, dayTarget: 1 },
    { regex: /\b(next tuesday)\b/i, dayTarget: 2 },
    { regex: /\b(next wednesday)\b/i, dayTarget: 3 },
    { regex: /\b(next thursday)\b/i, dayTarget: 4 },
    { regex: /\b(next friday)\b/i, dayTarget: 5 },
    { regex: /\b(on monday)\b/i, dayTarget: 1 },
    { regex: /\b(on tuesday)\b/i, dayTarget: 2 },
    { regex: /\b(on wednesday)\b/i, dayTarget: 3 },
    { regex: /\b(on thursday)\b/i, dayTarget: 4 },
    { regex: /\b(on friday)\b/i, dayTarget: 5 },
    { regex: /\b(this monday)\b/i, dayTarget: 1, thisWeek: true },
    { regex: /\b(this tuesday)\b/i, dayTarget: 2, thisWeek: true },
    { regex: /\b(this wednesday)\b/i, dayTarget: 3, thisWeek: true },
    { regex: /\b(this thursday)\b/i, dayTarget: 4, thisWeek: true },
    { regex: /\b(this friday)\b/i, dayTarget: 5, thisWeek: true },
    { regex: /\b(next week)\b/i, offset: 7 },
    { regex: /\bin (\d+) days?\b/i, daysFromNow: true },
    { regex: /\bin (\d+) weeks?\b/i, weeksFromNow: true },
  ];

  for (const p of patterns) {
    const match = title.match(p.regex);
    if (!match) continue;

    let dueDate;
    if (p.offset !== undefined) {
      dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + p.offset);
    } else if (p.dayTarget !== undefined) {
      dueDate = new Date(today);
      const currentDay = dueDate.getDay() || 7; // 1=Mon ... 7=Sun
      let diff = p.dayTarget - currentDay;
      if (p.thisWeek) {
        if (diff <= 0) diff += 7; // if day already passed this week, go to next
      } else {
        if (diff <= 0) diff += 7; // "next X" or "on X" = next occurrence
      }
      dueDate.setDate(dueDate.getDate() + diff);
    } else if (p.daysFromNow) {
      dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + parseInt(match[1]));
    } else if (p.weeksFromNow) {
      dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + parseInt(match[1]) * 7);
    }

    if (dueDate) {
      const cleanTitle = title.replace(match[0], '').replace(/\s{2,}/g, ' ').trim();
      return { cleanTitle: cleanTitle || title.trim(), dueDate: formatDate(dueDate) };
    }
  }
  return null;
}

// --- Linkify: convert URLs in text to clickable links, preserve newlines (HTML-safe) ---
function linkifyText(text) {
  if (!text) return '';
  // Escape HTML first
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // Convert URLs to links
  const linked = escaped.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener" style="color:var(--sophos-blue);text-decoration:underline;" onclick="event.stopPropagation()">$1</a>'
  );
  // Preserve newlines
  return linked.replace(/\n/g, '<br>');
}

// --- Recurrence: compute next due date ---
function computeNextDueDate(currentDue, recurrence, customDays) {
  const d = parseDate(currentDue);
  switch (recurrence) {
    case 'daily': d.setDate(d.getDate() + 1); break;
    case 'weekly': d.setDate(d.getDate() + 7); break;
    case 'fortnightly': d.setDate(d.getDate() + 14); break;
    case 'monthly': d.setMonth(d.getMonth() + 1); break;
    case 'annual': d.setFullYear(d.getFullYear() + 1); break;
    case 'custom': d.setDate(d.getDate() + (parseInt(customDays) || 7)); break;
    default: return null;
  }
  return formatDate(d);
}

// ===================== Persistence =====================
// Data is saved to both localStorage (fast cache) and data.json via the local server.
// On load, file takes priority over localStorage (file is the source of truth).

let _useFileAPI = false; // Set to true once we confirm the server is running

function stateToJSON(state) {
  return JSON.stringify({
    version: SCHEMA_VERSION,
    currentWeekKey: state.currentWeekKey,
    settings: state.settings,
    todos: state.todos,
    weeks: state.weeks,
    opportunities: state.opportunities,
    issues: state.issues,
    quickNotes: state.quickNotes,
    archive: state.archive,
  });
}

function parseAndMigrate(raw) {
  try {
    const data = JSON.parse(raw);
    if (!data || !data.version) return null;
    if (data.version === SCHEMA_VERSION) return data;
    return migrateData(data);
  } catch (e) { return null; }
}

function loadData() {
  // Synchronous load from localStorage (file load happens async after init)
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return parseAndMigrate(raw);
  } catch (e) { console.warn('Failed to load from localStorage:', e); }
  return null;
}

async function loadDataFromFile() {
  try {
    const resp = await fetch('/api/load');
    if (resp.ok) {
      const text = await resp.text();
      if (text && text !== 'null') {
        _useFileAPI = true;
        return parseAndMigrate(text);
      }
      // Server responded but no file yet — that's fine, we'll create it on first save
      _useFileAPI = true;
    }
  } catch (e) {
    // Server not running — fall back to localStorage only
    _useFileAPI = false;
  }
  return null;
}

function saveData(state) {
  const json = stateToJSON(state);

  // Always save to localStorage as fast cache
  try { localStorage.setItem(STORAGE_KEY, json); } catch (e) { /* ignore */ }

  // Save to file if server is available
  if (_useFileAPI) {
    fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: json,
    }).catch(() => {
      // Server went away — keep using localStorage
      console.warn('File save failed, using localStorage only');
    });
  }
}

function migrateData(data) {
  // v1 -> v2
  if (data.version === 1) {
    const catMap = { 'prospecting': 'prospecting', 'customerMeetings': 'customerMeetings', 'quotingProposals': 'pipelineForecasting', 'followUps': 'pipelineForecasting', 'partnerEngagement': 'partnerEngagement', 'internalAdmin': 'enablementAdmin' };
    if (data.weeks) {
      Object.values(data.weeks).forEach(week => {
        if (!week.cadence) { week.cadence = {}; ALL_CADENCE_IDS.forEach(id => week.cadence[id] = false); }
        if (!week.meetings) week.meetings = { customerCQ: 0, customerNQ: 0, partner: 0 };
        if (week.days) Object.values(week.days).forEach(day => {
          if (day.todos) day.todos.forEach(t => { t.category = catMap[t.category] || t.category; });
        });
      });
    }
    if (data.opportunities) data.opportunities.forEach(o => { if (!o.meddpicc) o.meddpicc = createEmptyMeddpicc(); });
    if (data.settings && data.settings.timeAllocationTargets) {
      const old = data.settings.timeAllocationTargets;
      data.settings.timeAllocationTargets = {
        customerMeetings: old.customerMeetings || 35, partnerEngagement: old.partnerEngagement || 15,
        prospecting: old.prospecting || 15, pipelineForecasting: (old.quotingProposals || 0) + (old.followUps || 0) || 15,
        territoryPlanning: 10, enablementAdmin: old.internalAdmin || 10,
      };
    }
    data.version = 2;
  }

  // v2 -> v3: Extract todos from week days into global todos array, add cadence timestamps
  if (data.version === 2) {
    const globalTodos = [];
    if (data.weeks) {
      Object.entries(data.weeks).forEach(([weekKey, week]) => {
        if (week.days) {
          Object.entries(week.days).forEach(([dateStr, day]) => {
            if (day.todos) {
              day.todos.forEach(t => {
                globalTodos.push({
                  id: t.id,
                  title: t.title,
                  dueDate: dateStr,
                  priority: t.priority === 'high' ? 'high' : t.priority === 'low' ? 'low' : 'medium',
                  category: t.category,
                  completed: t.completed,
                  completedAt: t.completedAt,
                  createdAt: t.createdAt,
                  recurrence: 'none',
                  customDays: null,
                  notes: t.notes ? [{ id: generateId('tn'), text: t.notes, timestamp: t.createdAt }] : [],
                });
              });
            }
            // Clear day todos — planner now reads from global
            day.todos = undefined;
          });
        }
        // Migrate cadence booleans to timestamps
        if (week.cadence) {
          Object.keys(week.cadence).forEach(key => {
            if (week.cadence[key] === true) {
              week.cadence[key] = new Date().toISOString();
            } else if (!week.cadence[key]) {
              week.cadence[key] = null;
            }
          });
        }
      });
    }
    data.todos = globalTodos;
    data.version = 3;
  }

  // v3 -> v4: Move cadence items to settings for customization
  if (data.version === 3) {
    if (!data.settings) data.settings = {};
    data.settings.cadenceItems = JSON.parse(JSON.stringify(DEFAULT_CADENCE_ITEMS));
    data.version = 4;
  }

  // v4 -> v5: Opp notes string -> timestamped array, add nextStep/status fields, simplify issue statuses
  if (data.version === 4) {
    if (data.opportunities) {
      data.opportunities.forEach(opp => {
        if (typeof opp.notes === 'string') {
          opp.notes = opp.notes.trim() ? [{ id: generateId('on'), text: opp.notes.trim(), timestamp: opp.createdAt || new Date().toISOString() }] : [];
        }
        if (!opp.nextStepDate) opp.nextStepDate = '';
        if (!opp.nextStepText) opp.nextStepText = '';
        if (!opp.status) opp.status = opp.archived ? 'closed' : 'open';
      });
    }
    if (data.issues) {
      data.issues.forEach(iss => {
        if (!iss.nextStepDate) iss.nextStepDate = '';
        if (!iss.nextStepText) iss.nextStepText = '';
        // Collapse inProgress -> open
        if (iss.status === 'inProgress') iss.status = 'open';
      });
    }
    data.version = 5;
  }

  return data;
}

function createDefaultState() {
  const today = new Date();
  const weekKey = getISOWeekKey(today);
  const state = {
    currentWeekKey: weekKey,
    settings: { showWeekends: false, carryForwardIncomplete: true, timeAllocationTargets: { ...DEFAULT_TARGETS }, cadenceItems: JSON.parse(JSON.stringify(DEFAULT_CADENCE_ITEMS)) },
    todos: [],
    weeks: {},
    opportunities: [],
    issues: [],
    quickNotes: [],
    archive: {},
  };
  initializeWeek(state, weekKey);
  return state;
}

function initializeWeek(state, weekKey) {
  if (!state.weeks[weekKey]) {
    state.weeks[weekKey] = {
      cadence: {},
      meetings: { customerCQ: 0, customerNQ: 0, partner: 0 },
    };
  }
  const w = state.weeks[weekKey];
  if (!w.cadence) w.cadence = {};
  const cadenceItems = (state.settings && state.settings.cadenceItems) || DEFAULT_CADENCE_ITEMS;
  getCadenceIds(cadenceItems).forEach(id => { if (w.cadence[id] === undefined) w.cadence[id] = null; });
  if (!w.meetings) w.meetings = { customerCQ: 0, customerNQ: 0, partner: 0 };
}

let saveTimeout = null;
function debouncedSave(state) {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => saveData(state), 300);
}

// ===================== Alpine Store =====================
document.addEventListener('alpine:init', () => {
  // Start with localStorage data (synchronous, instant)
  const loaded = loadData();
  const initial = loaded || createDefaultState();
  const realWeekKey = getISOWeekKey(new Date());
  initializeWeek(initial, realWeekKey);
  if (loaded && loaded.currentWeekKey !== realWeekKey) {
    initial.currentWeekKey = realWeekKey;
  }

  // Async: try to load from data.json file (takes priority over localStorage)
  loadDataFromFile().then(fileData => {
    const store = Alpine.store('app');
    if (fileData) {
      const rk = getISOWeekKey(new Date());
      initializeWeek(fileData, rk);
      if (fileData.currentWeekKey !== rk) fileData.currentWeekKey = rk;
      Object.assign(store, fileData);
      store.viewingWeekKey = fileData.currentWeekKey;
      store.today = getToday();
      store.showWizard = false; // Has data, skip wizard
      console.log('Loaded data from data.json');
    } else if (_useFileAPI) {
      // Server running but no data.json — this is a FRESH instance.
      // Ignore any stale localStorage from another folder on the same port.
      // Clear localStorage to avoid cross-folder bleed, start clean.
      localStorage.removeItem(STORAGE_KEY);
      const fresh = createDefaultState();
      Object.assign(store, fresh);
      store.viewingWeekKey = fresh.currentWeekKey;
      store.today = getToday();
      store.showWizard = true; // Show wizard for new instance
      console.log('Fresh instance — cleared stale localStorage, showing wizard');
    }
  });

  Alpine.store('app', {
    ...initial,
    viewingWeekKey: initial.currentWeekKey,
    today: getToday(),

    // --- UI State ---
    expandedTodo: null,
    showAddTodo: false,
    newTodo: { title: '', dueDate: getToday(), category: 'customerMeetings', priority: 'medium', recurrence: 'none', customDays: '' },
    todoSort: 'dueDate',
    todoSortAsc: true,
    todoFilter: 'active', // active, today, overdue, completed, all
    todoNoteText: '',
    showAddOpp: false,
    newOpp: { accountName: '', dealSize: '', type: 'newLogo', stage: '', salesforceLink: '', expectedCloseDate: '', notes: '', nextStepDate: '', nextStepText: '' },
    expandedOpp: null,
    newOppNote: '',
    oppFilter: 'open',
    oppTypeFilter: 'all',
    oppSort: 'expectedCloseDate',
    oppSortAsc: true,
    showAddIssue: false,
    newIssue: { title: '', account: '', type: 'supportCase', link: '', notes: '', nextStepDate: '', nextStepText: '' },
    expandedIssue: null,
    issueFilter: 'open',
    newIssueNote: '',
    newQuickNote: '',
    notesSearch: '',
    showSettings: false,
    showAddCadence: false,
    editingCadence: null,
    newCadence: { label: '', duration: '30min', day: 'Mon', frequency: 'weekly', description: '' },
    showWizard: !loaded, // Show wizard on first run (no existing data)
    wizardName: '',
    showHelp: false,
    helpSection: 'overview',
    showReport: false,
    reportMonth: formatDate(new Date()).substring(0, 7), // YYYY-MM
    reportShow: { cadence: true, todos: true, meetings: true, opportunities: true, issues: true },
    activeNav: 'planner',

    // --- Computed ---
    get isViewingCurrentWeek() { return this.viewingWeekKey === this.currentWeekKey; },
    get viewingWeekDates() {
      const d = getWeekDates(this.viewingWeekKey);
      return this.settings.showWeekends ? d : d.slice(0, 5);
    },
    get viewingWeekDisplay() { return getWeekDisplayRange(this.viewingWeekKey); },

    // ======= PLANNER: todos + cadence + next steps grouped by day =======
    get weekDays() {
      return this.viewingWeekDates.map(dateStr => {
        const dayAbbrev = getDayName(dateStr);
        return {
          dateStr,
          dayName: dayAbbrev,
          dayDate: getDayDate(dateStr),
          isToday: dateStr === this.today,
          todos: this.todos
            .filter(t => t.dueDate === dateStr && !t.completed)
            .sort((a, b) => (PRIORITIES[a.priority]?.sort || 2) - (PRIORITIES[b.priority]?.sort || 2)),
          completedTodos: this.todos
            .filter(t => t.dueDate === dateStr && t.completed)
            .sort((a, b) => (PRIORITIES[a.priority]?.sort || 2) - (PRIORITIES[b.priority]?.sort || 2)),
          cadenceItems: this.visibleCadenceItems.filter(i => i.day === dayAbbrev),
          oppNextSteps: this.opportunities.filter(o => !o.archived && o.nextStepDate === dateStr),
          issueNextSteps: this.issues.filter(i => i.status !== 'resolved' && i.nextStepDate === dateStr),
        };
      });
    },

    // ======= TO-DO LIST: filtered and sorted global view =======
    get filteredTodos() {
      const today = this.today;
      let list = [...this.todos];
      switch (this.todoFilter) {
        case 'today': list = list.filter(t => t.dueDate === today && !t.completed); break;
        case 'overdue': list = list.filter(t => t.dueDate < today && !t.completed); break;
        case 'active': list = list.filter(t => !t.completed); break;
        case 'completed': list = list.filter(t => t.completed); break;
        // 'all': no filter
      }
      const sortKey = this.todoSort;
      const asc = this.todoSortAsc;
      list.sort((a, b) => {
        let va, vb;
        if (sortKey === 'priority') { va = PRIORITIES[a.priority]?.sort ?? 2; vb = PRIORITIES[b.priority]?.sort ?? 2; }
        else if (sortKey === 'dueDate') { va = a.dueDate; vb = b.dueDate; }
        else if (sortKey === 'title') { va = a.title.toLowerCase(); vb = b.title.toLowerCase(); }
        else if (sortKey === 'category') { va = a.category; vb = b.category; }
        else { va = a[sortKey]; vb = b[sortKey]; }
        if (va < vb) return asc ? -1 : 1;
        if (va > vb) return asc ? 1 : -1;
        return 0;
      });
      return list;
    },

    get overdueCount() {
      return this.todos.filter(t => t.dueDate < this.today && !t.completed).length;
    },

    get todayCount() {
      return this.todos.filter(t => t.dueDate === this.today && !t.completed).length;
    },

    // --- Todo CRUD ---
    submitNewTodo() {
      if (!this.newTodo.title.trim()) return;
      const parsed = extractDateFromTitle(this.newTodo.title.trim());
      const title = parsed ? parsed.cleanTitle : this.newTodo.title.trim();
      const dueDate = parsed ? parsed.dueDate : (this.newTodo.dueDate || this.today);
      this.todos.push({
        id: generateId('todo'),
        title: title,
        dueDate: dueDate,
        priority: this.newTodo.priority,
        category: this.newTodo.category,
        recurrence: this.newTodo.recurrence,
        customDays: this.newTodo.recurrence === 'custom' ? parseInt(this.newTodo.customDays) || 7 : null,
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString(),
        notes: [],
      });
      this.newTodo = { title: '', dueDate: this.newTodo.dueDate, category: this.newTodo.category, priority: 'medium', recurrence: 'none', customDays: '' };
      this.showAddTodo = false;
      debouncedSave(this);
    },

    // Quick add from planner day column
    quickAddTodo(dayKey) {
      const rawTitle = prompt('Task title:');
      if (!rawTitle || !rawTitle.trim()) return;
      const parsed = extractDateFromTitle(rawTitle.trim());
      const title = parsed ? parsed.cleanTitle : rawTitle.trim();
      const dueDate = parsed ? parsed.dueDate : dayKey;
      this.todos.push({
        id: generateId('todo'),
        title: title,
        dueDate: dueDate,
        priority: 'medium',
        category: 'customerMeetings',
        recurrence: 'none',
        customDays: null,
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString(),
        notes: [],
      });
      debouncedSave(this);
    },

    toggleTodoComplete(todoId) {
      const todo = this.todos.find(t => t.id === todoId);
      if (!todo) return;
      if (!todo.completed) {
        // Mark complete
        todo.completed = true;
        todo.completedAt = new Date().toISOString();
        // If recurring, create next occurrence
        if (todo.recurrence && todo.recurrence !== 'none') {
          const nextDue = computeNextDueDate(todo.dueDate, todo.recurrence, todo.customDays);
          if (nextDue) {
            this.todos.push({
              id: generateId('todo'),
              title: todo.title,
              dueDate: nextDue,
              priority: todo.priority,
              category: todo.category,
              recurrence: todo.recurrence,
              customDays: todo.customDays,
              completed: false,
              completedAt: null,
              createdAt: new Date().toISOString(),
              notes: [],
            });
          }
        }
      } else {
        todo.completed = false;
        todo.completedAt = null;
      }
      debouncedSave(this);
    },

    updateTodoField(todoId, field, value) {
      const todo = this.todos.find(t => t.id === todoId);
      if (!todo) return;
      if (field === 'customDays') value = parseInt(value) || 7;
      todo[field] = value;
      debouncedSave(this);
    },

    addTodoNote(todoId) {
      if (!this.todoNoteText.trim()) return;
      const todo = this.todos.find(t => t.id === todoId);
      if (!todo) return;
      if (!todo.notes) todo.notes = [];
      todo.notes.push({ id: generateId('tn'), text: this.todoNoteText.trim(), timestamp: new Date().toISOString() });
      this.todoNoteText = '';
      debouncedSave(this);
    },

    deleteTodo(todoId) {
      this.todos = this.todos.filter(t => t.id !== todoId);
      if (this.expandedTodo === todoId) this.expandedTodo = null;
      debouncedSave(this);
    },

    toggleExpandTodo(todoId) { this.expandedTodo = this.expandedTodo === todoId ? null : todoId; },

    moveTodoToDate(todoId, newDate) {
      const todo = this.todos.find(t => t.id === todoId);
      if (todo) { todo.dueDate = newDate; debouncedSave(this); }
    },

    // For SortableJS drag between planner columns
    moveTodoBetweenDays(todoId, toDay, newIndex) {
      const todo = this.todos.find(t => t.id === todoId);
      if (todo) { todo.dueDate = toDay; debouncedSave(this); }
    },

    getRecurrenceLabel(todo) {
      if (!todo.recurrence || todo.recurrence === 'none') return '';
      if (todo.recurrence === 'custom') return `Every ${todo.customDays || 7}d`;
      return RECURRENCE_OPTIONS[todo.recurrence]?.label || '';
    },

    // --- Meeting Tracker ---
    get currentMeetings() {
      const w = this.weeks[this.currentWeekKey];
      return w ? w.meetings : { customerCQ: 0, customerNQ: 0, partner: 0 };
    },
    get totalMeetings() { const m = this.currentMeetings; return m.customerCQ + m.customerNQ + m.partner; },
    adjustMeeting(type, delta) {
      const w = this.weeks[this.currentWeekKey];
      if (w) { w.meetings[type] = Math.max(0, (w.meetings[type] || 0) + delta); debouncedSave(this); }
    },

    // --- Cadence (customizable, with timestamps) ---
    get cadenceItems() { return this.settings.cadenceItems || DEFAULT_CADENCE_ITEMS; },
    get currentCadence() { const w = this.weeks[this.viewingWeekKey]; return w ? w.cadence : {}; },

    get visibleCadenceItems() {
      const wk = this.viewingWeekKey;
      return this.cadenceItems.filter(i => {
        if (i.frequency === 'weekly') return true;
        if (i.frequency === 'fortnightly') return isFortnightlyWeek(wk);
        if (i.frequency === 'monthly') return isFirstWeekOfMonth(wk);
        return true;
      });
    },

    get cadenceProgress() {
      const visible = this.visibleCadenceItems;
      const cadence = this.currentCadence;
      return { completed: visible.filter(i => cadence[i.id]).length, total: visible.length };
    },

    cadenceItemsForDay(dayAbbrev) {
      return this.visibleCadenceItems.filter(i => i.day === dayAbbrev);
    },

    toggleCadence(itemId) {
      const w = this.weeks[this.viewingWeekKey];
      if (!w || !w.cadence) return;
      w.cadence[itemId] = w.cadence[itemId] ? null : new Date().toISOString();
      debouncedSave(this);
    },

    getCadenceTime(itemId) {
      const ts = this.currentCadence[itemId];
      if (!ts || typeof ts !== 'string') return null;
      return formatShortTimestamp(ts);
    },

    // Cadence CRUD
    addCadenceItem(item) {
      if (!item.label.trim()) return;
      this.settings.cadenceItems.push({
        id: generateId('cad'),
        label: item.label.trim(),
        duration: item.duration || '30min',
        day: item.day || 'Mon',
        frequency: item.frequency || 'weekly',
        description: item.description || '',
      });
      debouncedSave(this);
    },

    updateCadenceItem(itemId, field, value) {
      const item = this.settings.cadenceItems.find(i => i.id === itemId);
      if (item) { item[field] = value; debouncedSave(this); }
    },

    deleteCadenceItem(itemId) {
      this.settings.cadenceItems = this.settings.cadenceItems.filter(i => i.id !== itemId);
      debouncedSave(this);
    },

    resetCadenceToDefaults() {
      if (!confirm('Reset cadence items to handbook defaults? Your custom items will be lost.')) return;
      this.settings.cadenceItems = JSON.parse(JSON.stringify(DEFAULT_CADENCE_ITEMS));
      debouncedSave(this);
    },

    loadCadenceTemplate(templateKey, replace) {
      const template = CADENCE_TEMPLATES[templateKey];
      if (!template) return;
      if (replace) {
        this.settings.cadenceItems = JSON.parse(JSON.stringify(template.items));
      } else {
        // Append — add items with new IDs to avoid conflicts
        const existing = new Set(this.settings.cadenceItems.map(i => i.label));
        template.items.forEach(item => {
          if (!existing.has(item.label)) {
            this.settings.cadenceItems.push({ ...JSON.parse(JSON.stringify(item)), id: generateId('cad') });
          }
        });
      }
      debouncedSave(this);
    },

    // --- Setup Wizard ---
    completeWizard(role) {
      this.settings.role = role;
      if (this.wizardName.trim()) this.settings.userName = this.wizardName.trim();
      this.settings.cadenceItems = JSON.parse(JSON.stringify(CADENCE_TEMPLATES[role]?.items || DEFAULT_CADENCE_ITEMS));
      this.showWizard = false;
      debouncedSave(this);
    },

    // --- Activity Tracker ---
    get activityStats() {
      const weekDates = getWeekDates(this.currentWeekKey);
      const weekSet = new Set(weekDates);
      const counts = {}; let total = 0;
      CATEGORY_KEYS.forEach(k => counts[k] = 0);
      this.todos.forEach(t => {
        if (weekSet.has(t.dueDate) && counts[t.category] !== undefined) { counts[t.category]++; total++; }
      });
      const targets = this.settings.timeAllocationTargets;
      return CATEGORY_KEYS.map(k => {
        const count = counts[k], pct = total > 0 ? Math.round((count / total) * 100) : 0, target = targets[k] || 0;
        let status = 'on-track';
        if (total > 0 && pct < target * 0.5) status = 'critical';
        else if (total > 0 && pct < target) status = 'below';
        return { key: k, label: CATEGORIES[k].label, color: CATEGORIES[k].color, count, pct, target, status };
      });
    },

    get nudges() {
      const msgs = [], dow = new Date().getDay();
      if (dow >= 1 && dow <= 2) return msgs;
      const m = this.currentMeetings;
      if (dow >= 3 && (m.customerCQ + m.customerNQ) < 4) msgs.push('Fewer than 4 customer meetings logged. Target is 10/week.');
      if (dow >= 4 && m.partner < 1) msgs.push('No partner meetings yet. Target is 2/week.');
      this.activityStats.forEach(s => {
        if (s.status === 'critical') {
          if (s.key === 'prospecting') msgs.push('Prospecting is light. New business = 85% of commission.');
          else if (s.key === 'customerMeetings') msgs.push('Customer meeting activity is low. Aim for 2 per day.');
        }
      });
      if (this.overdueCount > 0) msgs.push(`You have ${this.overdueCount} overdue to-do${this.overdueCount > 1 ? 's' : ''}. Review your task list.`);
      return msgs;
    },

    // --- Opportunities ---
    get filteredOpportunities() {
      let opps = [...this.opportunities];
      if (this.oppFilter === 'open') opps = opps.filter(o => (o.status || 'open') === 'open');
      else if (this.oppFilter === 'closed') opps = opps.filter(o => o.status === 'closed');
      if (this.oppTypeFilter !== 'all') opps = opps.filter(o => o.type === this.oppTypeFilter);
      const sortKey = this.oppSort, asc = this.oppSortAsc;
      opps.sort((a, b) => {
        let va = a[sortKey], vb = b[sortKey];
        if (sortKey === 'dealSize') { va = Number(va) || 0; vb = Number(vb) || 0; }
        if (sortKey === 'priority') { va = va ? 1 : 0; vb = vb ? 1 : 0; }
        if (va < vb) return asc ? -1 : 1; if (va > vb) return asc ? 1 : -1; return 0;
      });
      return opps;
    },
    oppCount(statusFilter, typeFilter) {
      let opps = [...this.opportunities];
      if (statusFilter === 'open') opps = opps.filter(o => (o.status || 'open') === 'open');
      else if (statusFilter === 'closed') opps = opps.filter(o => o.status === 'closed');
      if (typeFilter !== 'all') opps = opps.filter(o => o.type === typeFilter);
      return opps.length;
    },
    submitOpportunity() {
      if (!this.newOpp.accountName.trim()) return;
      const initialNotes = this.newOpp.notes.trim()
        ? [{ id: generateId('on'), text: this.newOpp.notes.trim(), timestamp: new Date().toISOString() }]
        : [];
      this.opportunities.push({
        id: generateId('opp'), accountName: this.newOpp.accountName.trim(),
        dealSize: parseFloat(this.newOpp.dealSize) || 0, type: this.newOpp.type,
        stage: this.newOpp.stage.trim(), salesforceLink: this.newOpp.salesforceLink.trim(),
        expectedCloseDate: this.newOpp.expectedCloseDate, priority: false,
        status: 'open',
        notes: initialNotes,
        nextStepDate: this.newOpp.nextStepDate || '',
        nextStepText: this.newOpp.nextStepText || '',
        meddpicc: createEmptyMeddpicc(),
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), archived: false,
      });
      this.newOpp = { accountName: '', dealSize: '', type: 'newLogo', stage: '', salesforceLink: '', expectedCloseDate: '', notes: '', nextStepDate: '', nextStepText: '' };
      this.showAddOpp = false; debouncedSave(this);
    },
    toggleOppPriority(id) { const o = this.opportunities.find(x => x.id === id); if (o) { o.priority = !o.priority; o.updatedAt = new Date().toISOString(); debouncedSave(this); } },
    toggleExpandOpp(id) { this.expandedOpp = this.expandedOpp === id ? null : id; this.newOppNote = ''; },
    addOppNote(id) {
      if (!this.newOppNote.trim()) return;
      const o = this.opportunities.find(x => x.id === id);
      if (!o) return;
      if (!Array.isArray(o.notes)) o.notes = [];
      o.notes.push({ id: generateId('on'), text: this.newOppNote.trim(), timestamp: new Date().toISOString() });
      this.newOppNote = '';
      o.updatedAt = new Date().toISOString();
      debouncedSave(this);
    },
    updateOppField(id, field, value) { const o = this.opportunities.find(x => x.id === id); if (o) { o[field] = field === 'dealSize' ? (parseFloat(value) || 0) : value; o.updatedAt = new Date().toISOString(); debouncedSave(this); } },
    updateMeddpicc(id, field, value) { const o = this.opportunities.find(x => x.id === id); if (o) { if (!o.meddpicc) o.meddpicc = createEmptyMeddpicc(); o.meddpicc[field] = value; o.updatedAt = new Date().toISOString(); debouncedSave(this); } },
    getMeddpiccScore(opp) { if (!opp.meddpicc) return 0; return MEDDPICC_FIELDS.filter(f => opp.meddpicc[f.key]?.trim()).length; },
    updateOppStatus(id, status) {
      const o = this.opportunities.find(x => x.id === id);
      if (o) { o.status = status; o.updatedAt = new Date().toISOString(); debouncedSave(this); }
    },
    archiveOpportunity(id) { const o = this.opportunities.find(x => x.id === id); if (o) { o.archived = true; o.updatedAt = new Date().toISOString(); this.expandedOpp = null; debouncedSave(this); } },
    deleteOpportunity(id) {
      if (!confirm('Permanently delete this opportunity?')) return;
      this.opportunities = this.opportunities.filter(x => x.id !== id);
      if (this.expandedOpp === id) this.expandedOpp = null;
      debouncedSave(this);
    },
    getOppCloseDaysLeft(opp) { return opp.expectedCloseDate ? daysBetween(this.today, opp.expectedCloseDate) : null; },
    getOppUrgency(opp) { const d = this.getOppCloseDaysLeft(opp); if (d === null) return ''; if (d <= 7) return 'urgent-critical'; if (d <= 14) return 'urgent-warning'; return ''; },

    // --- Issues ---
    get filteredIssues() { return this.issueFilter === 'all' ? this.issues : this.issues.filter(i => i.status === this.issueFilter); },
    submitIssue() {
      if (!this.newIssue.title.trim()) return;
      this.issues.push({
        id: generateId('iss'), title: this.newIssue.title.trim(), account: this.newIssue.account.trim(),
        type: this.newIssue.type, status: 'open', link: this.newIssue.link.trim(),
        dateOpened: getToday(), resolvedAt: null,
        nextStepDate: this.newIssue.nextStepDate || '',
        nextStepText: this.newIssue.nextStepText || '',
        notes: this.newIssue.notes.trim() ? [{ id: generateId('note'), text: this.newIssue.notes.trim(), timestamp: new Date().toISOString() }] : [],
      });
      this.newIssue = { title: '', account: '', type: 'supportCase', link: '', notes: '', nextStepDate: '', nextStepText: '' };
      this.showAddIssue = false; debouncedSave(this);
    },
    toggleExpandIssue(id) { this.expandedIssue = this.expandedIssue === id ? null : id; this.newIssueNote = ''; },
    updateIssueStatus(id, status) { const i = this.issues.find(x => x.id === id); if (i) { i.status = status; i.resolvedAt = status === 'resolved' ? getToday() : null; debouncedSave(this); } },
    addIssueNote(id) { if (!this.newIssueNote.trim()) return; const i = this.issues.find(x => x.id === id); if (i) { i.notes.push({ id: generateId('note'), text: this.newIssueNote.trim(), timestamp: new Date().toISOString() }); this.newIssueNote = ''; debouncedSave(this); } },
    updateIssueField(id, field, value) { const i = this.issues.find(x => x.id === id); if (i) { i[field] = value; debouncedSave(this); } },
    deleteIssue(id) { this.issues = this.issues.filter(x => x.id !== id); if (this.expandedIssue === id) this.expandedIssue = null; debouncedSave(this); },
    getIssueDaysOpen(issue) { return daysBetween(issue.dateOpened, issue.resolvedAt || getToday()); },

    // --- Quick Notes ---
    get filteredNotes() {
      let notes = [...this.quickNotes];
      if (this.notesSearch.trim()) { const q = this.notesSearch.toLowerCase(); notes = notes.filter(n => n.text.toLowerCase().includes(q)); }
      notes.sort((a, b) => { if (a.pinned !== b.pinned) return a.pinned ? -1 : 1; return new Date(b.timestamp) - new Date(a.timestamp); });
      return notes;
    },
    addQuickNote() { if (!this.newQuickNote.trim()) return; this.quickNotes.push({ id: generateId('qn'), text: this.newQuickNote.trim(), timestamp: new Date().toISOString(), pinned: false }); this.newQuickNote = ''; debouncedSave(this); },
    togglePinNote(id) { const n = this.quickNotes.find(x => x.id === id); if (n) { n.pinned = !n.pinned; debouncedSave(this); } },
    deleteNote(id) { this.quickNotes = this.quickNotes.filter(x => x.id !== id); debouncedSave(this); },

    // --- Week Navigation ---
    goToWeek(delta) { this.viewingWeekKey = navigateWeek(this.viewingWeekKey, delta); initializeWeek(this, this.viewingWeekKey); debouncedSave(this); },
    goToCurrentWeek() { this.viewingWeekKey = this.currentWeekKey; },

    // --- Settings ---
    updateTarget(key, value) { this.settings.timeAllocationTargets[key] = parseInt(value) || 0; debouncedSave(this); },
    toggleWeekends() { this.settings.showWeekends = !this.settings.showWeekends; debouncedSave(this); },
    toggleCarryForward() { this.settings.carryForwardIncomplete = !this.settings.carryForwardIncomplete; debouncedSave(this); },

    // --- Export / Import ---
    exportData() {
      const blob = new Blob([JSON.stringify({ version: SCHEMA_VERSION, currentWeekKey: this.currentWeekKey, settings: this.settings, todos: this.todos, weeks: this.weeks, opportunities: this.opportunities, issues: this.issues, quickNotes: this.quickNotes, archive: this.archive, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `sophos-organiser-backup-${getToday()}.json`; a.click(); URL.revokeObjectURL(url);
    },
    importData(event) {
      const file = event.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          let data = JSON.parse(e.target.result);
          if (!data.version) { alert('Invalid backup file.'); return; }
          if (data.version < SCHEMA_VERSION) data = migrateData(data);
          this.currentWeekKey = data.currentWeekKey; this.viewingWeekKey = data.currentWeekKey;
          this.settings = data.settings; this.todos = data.todos || []; this.weeks = data.weeks || {};
          this.opportunities = data.opportunities || []; this.issues = data.issues || [];
          this.quickNotes = data.quickNotes || []; this.archive = data.archive || {};
          saveData(this); alert('Data imported successfully.');
        } catch (err) { alert('Import failed: ' + err.message); }
      };
      reader.readAsText(file);
    },
    clearAllData() {
      if (!confirm('Clear all data? This cannot be undone.')) return;
      localStorage.removeItem(STORAGE_KEY);
      const fresh = createDefaultState();
      Object.assign(this, fresh); this.viewingWeekKey = fresh.currentWeekKey; saveData(this);
    },
    scrollTo(sectionId) { this.activeNav = sectionId; const el = document.getElementById(sectionId); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); },

    scrollToOpp(oppId) {
      this.activeNav = 'opportunities';
      this.expandedOpp = oppId;
      setTimeout(() => {
        const el = document.querySelector(`[data-opp-id="${oppId}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    },

    scrollToIssue(issueId) {
      this.activeNav = 'issues';
      this.expandedIssue = issueId;
      setTimeout(() => {
        const el = document.querySelector(`[data-issue-id="${issueId}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    },

    // =================== REPORTS ===================
    toggleReportSection(key) {
      this.reportShow[key] = !this.reportShow[key];
    },

    get reportMonthLabel() {
      const [y, m] = this.reportMonth.split('-');
      return new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
    },

    // Get all ISO week keys that overlap with the selected month
    get reportWeekKeys() {
      const [y, m] = this.reportMonth.split('-').map(Number);
      const firstDay = new Date(y, m - 1, 1);
      const lastDay = new Date(y, m, 0); // last day of month
      const weeks = new Set();
      const d = new Date(firstDay);
      while (d <= lastDay) {
        weeks.add(getISOWeekKey(d));
        d.setDate(d.getDate() + 1);
      }
      return [...weeks].sort();
    },

    getReportWeekData(weekKey) {
      const dates = getWeekDates(weekKey);
      const weekStart = parseDate(dates[0]);
      const weekEnd = parseDate(dates[6]);
      const weekLabel = `${weekStart.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} – ${weekEnd.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`;
      const weekData = this.weeks[weekKey] || { cadence: {}, meetings: { customerCQ: 0, customerNQ: 0, partner: 0 } };
      const cadenceItems = this.settings.cadenceItems || DEFAULT_CADENCE_ITEMS;

      // --- Cadence analysis ---
      const cadenceResults = [];
      const cadenceTimestamps = []; // all completion timestamps for honesty analysis
      const visibleCadence = cadenceItems.filter(i => {
        if (i.frequency === 'weekly') return true;
        if (i.frequency === 'fortnightly') return isFortnightlyWeek(weekKey);
        if (i.frequency === 'monthly') return isFirstWeekOfMonth(weekKey);
        return true;
      });
      visibleCadence.forEach(item => {
        const ts = weekData.cadence[item.id];
        const completed = !!ts && typeof ts === 'string';
        cadenceResults.push({
          id: item.id,
          label: item.label,
          day: item.day,
          frequency: item.frequency,
          completed,
          timestamp: completed ? ts : null,
          timeLabel: completed ? formatShortTimestamp(ts) : null,
          dayOfWeek: completed ? new Date(ts).getDay() : null, // 0=Sun
          hourOfDay: completed ? new Date(ts).getHours() + new Date(ts).getMinutes() / 60 : null,
        });
        if (completed) cadenceTimestamps.push(new Date(ts).getTime());
      });

      // Honesty analysis: check if items were bunched together
      let honestyFlag = 'good'; // good, warning, concern
      let honestyNote = '';
      if (cadenceTimestamps.length >= 3) {
        cadenceTimestamps.sort((a, b) => a - b);
        const firstTs = cadenceTimestamps[0];
        const lastTs = cadenceTimestamps[cadenceTimestamps.length - 1];
        const spanMinutes = (lastTs - firstTs) / 60000;
        const completedCount = cadenceTimestamps.length;

        if (completedCount >= 5 && spanMinutes < 10) {
          honestyFlag = 'concern';
          honestyNote = `${completedCount} items completed within ${Math.round(spanMinutes)} minutes`;
        } else if (completedCount >= 4 && spanMinutes < 30) {
          honestyFlag = 'warning';
          honestyNote = `${completedCount} items completed within ${Math.round(spanMinutes)} minutes`;
        } else {
          // Check how many unique days were used
          const uniqueDays = new Set(cadenceResults.filter(c => c.completed).map(c => c.dayOfWeek));
          if (uniqueDays.size === 1 && completedCount >= 5) {
            honestyFlag = 'warning';
            honestyNote = `All ${completedCount} items completed on the same day`;
          } else if (uniqueDays.size >= 3) {
            honestyNote = `Spread across ${uniqueDays.size} different days`;
          }
        }
      }

      const cadenceTotal = visibleCadence.length;
      const cadenceCompleted = cadenceResults.filter(c => c.completed).length;

      // --- Todos analysis ---
      const weekDateSet = new Set(dates);
      const weekTodos = this.todos.filter(t => weekDateSet.has(t.dueDate));
      const todosCompleted = weekTodos.filter(t => t.completed).length;
      const todosTotal = weekTodos.length;
      const todosByCategory = {};
      CATEGORY_KEYS.forEach(k => todosByCategory[k] = { total: 0, completed: 0 });
      weekTodos.forEach(t => {
        if (todosByCategory[t.category]) {
          todosByCategory[t.category].total++;
          if (t.completed) todosByCategory[t.category].completed++;
        }
      });

      // --- Meetings ---
      const meetings = weekData.meetings || { customerCQ: 0, customerNQ: 0, partner: 0 };
      const meetingsTotal = meetings.customerCQ + meetings.customerNQ + meetings.partner;

      // --- Opportunities active this week ---
      const oppActivity = {
        withNextStep: this.opportunities.filter(o => !o.archived && dates.some(d => o.nextStepDate === d)).length,
        open: this.opportunities.filter(o => !o.archived && (o.status || 'open') === 'open').length,
      };

      // --- Issues ---
      const issueActivity = {
        withNextStep: this.issues.filter(i => dates.some(d => i.nextStepDate === d)).length,
        open: this.issues.filter(i => i.status === 'open').length,
      };

      return {
        weekKey, weekLabel, dates,
        cadence: { results: cadenceResults, completed: cadenceCompleted, total: cadenceTotal, honestyFlag, honestyNote },
        todos: { total: todosTotal, completed: todosCompleted, byCategory: todosByCategory },
        meetings: { ...meetings, total: meetingsTotal },
        opportunities: oppActivity,
        issues: issueActivity,
      };
    },

    get reportData() {
      return this.reportWeekKeys.map(wk => this.getReportWeekData(wk));
    },

    get reportSummary() {
      const weeks = this.reportData;
      if (!weeks.length) return null;
      let cadenceTotal = 0, cadenceCompleted = 0;
      let todosTotal = 0, todosCompleted = 0;
      let meetingsTotal = 0, meetingsCQTotal = 0, meetingsNQTotal = 0, meetingsPartnerTotal = 0;
      let concernWeeks = 0, warningWeeks = 0;

      weeks.forEach(w => {
        cadenceTotal += w.cadence.total;
        cadenceCompleted += w.cadence.completed;
        todosTotal += w.todos.total;
        todosCompleted += w.todos.completed;
        meetingsTotal += w.meetings.total;
        meetingsCQTotal += w.meetings.customerCQ;
        meetingsNQTotal += w.meetings.customerNQ;
        meetingsPartnerTotal += w.meetings.partner;
        if (w.cadence.honestyFlag === 'concern') concernWeeks++;
        if (w.cadence.honestyFlag === 'warning') warningWeeks++;
      });

      return {
        weeks: weeks.length,
        cadence: { total: cadenceTotal, completed: cadenceCompleted, pct: cadenceTotal > 0 ? Math.round(cadenceCompleted / cadenceTotal * 100) : 0 },
        todos: { total: todosTotal, completed: todosCompleted, pct: todosTotal > 0 ? Math.round(todosCompleted / todosTotal * 100) : 0 },
        meetings: { total: meetingsTotal, cq: meetingsCQTotal, nq: meetingsNQTotal, partner: meetingsPartnerTotal, avgPerWeek: weeks.length > 0 ? Math.round(meetingsTotal / weeks.length * 10) / 10 : 0 },
        honesty: { concernWeeks, warningWeeks },
      };
    },

    printReport() {
      window.print();
    },
  });
});

// --- SortableJS ---
function initSortable(el, dayKey) {
  if (el._sortable) el._sortable.destroy();
  el._sortable = new Sortable(el, {
    group: 'todos', animation: 150, ghostClass: 'sortable-ghost', dragClass: 'sortable-drag',
    handle: '.todo-card', draggable: '.todo-card',
    onEnd(evt) {
      const todoId = evt.item.dataset.todoId;
      const toDay = evt.to.dataset.dayKey;
      Alpine.store('app').moveTodoBetweenDays(todoId, toDay, evt.newIndex);
    },
  });
}

// --- Keyboard Shortcuts ---
document.addEventListener('keydown', (e) => {
  const s = Alpine.store('app'); if (!s) return;
  if (e.key === 'Escape') {
    if (s.showHelp) { s.showHelp = false; return; }
    if (s.showReport) { s.showReport = false; return; }
    s.showSettings = false; s.showAddOpp = false; s.showAddIssue = false;
    s.showAddTodo = false; s.expandedTodo = null; s.expandedOpp = null; s.expandedIssue = null;
  }
  if (e.ctrlKey && e.key === 'ArrowRight') { e.preventDefault(); s.goToWeek(1); }
  if (e.ctrlKey && e.key === 'ArrowLeft') { e.preventDefault(); s.goToWeek(-1); }
});
window.addEventListener('beforeunload', () => { const s = Alpine.store('app'); if (s) saveData(s); });
