/* ============================================================
   Sophos Personal Organiser — Application Logic
   Aligned to ANZ Field "Day in the Life" Handbook v1.2
   ============================================================ */

const STORAGE_KEY = 'sophos-organiser-data';
const SCHEMA_VERSION = 3;

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

// --- Weekly Cadence ---
const CADENCE_ITEMS = {
  weekly: [
    { id: 'se-standup',      label: 'SE Weekly Action Plan',           duration: '30min', day: 'Mon', description: 'Review prior actions, align SE activities, solution map priorities' },
    { id: 'p-matrix',        label: 'P-Matrix Activity Plan',          duration: '30min', day: 'Mon', description: 'Review P-Matrix accounts, plan engagement & resources, expansion discovery' },
    { id: 'focus-30',        label: 'Focus 30 Expansion Review',       duration: '30min', day: 'Mon', description: 'Review Focus 30 list, targeted sales plays, research customers' },
    { id: 'territory-review',label: 'Territory Plan Review',           duration: '30min', day: 'Mon', description: 'P-Matrix progress, Focus 30 progress, NB initiatives, adjust plan' },
    { id: 'deal-reg',        label: 'Deal Reg Call Downs',             duration: '30min', day: 'Tue', description: 'Review & follow up on deal registrations, BANT qualify, partner alignment' },
    { id: 'coat-tailing',    label: 'Coat Tailing Research',           duration: '30min', day: 'Tue', description: 'LinkedIn cross-reference, track customer contact movements, outreach list' },
    { id: 'prospecting',     label: 'New Logo Prospecting',            duration: '60min', day: 'Wed', description: 'Market research, customer references, PBI whitespace, partner prospecting' },
    { id: 'sdr-calldowns',   label: 'SDR / Mktg Follow-up',           duration: '30min', day: 'Thu', description: 'Review SDR leads (within 48hrs), Clari dashboard, outbound campaign alignment' },
    { id: 'forecast-prep',   label: 'Forecast Prep & Deal Updates',    duration: '30min', day: 'Fri', description: 'Submit Clari forecast (Wed CoB), top 15 deal updates, MEDDPICC review for +$30K' },
  ],
  fortnightly: [
    { id: 'renewal-cadence', label: 'Renewal Cadence',                 duration: '30min', description: 'Cross-sell accounts from ATR, highlight at-risk, RAM vs TAE alignment' },
    { id: 'csm-cadence',     label: 'CSM Cadence',                     duration: '30min', description: 'Review CSM-led activity, account feedback, actions for review' },
    { id: 'channel-cadence', label: 'Channel Cadence / Adopt a Rep',   duration: '30min', description: 'Managed partner activity, sponsor-a-rep review, joint engagement opps' },
  ],
  monthly: [
    { id: 'deal-review',     label: 'Week 2/8 Deal Review',            duration: '30min', description: 'Complete deal review template, identify key NB opps, steps to close' },
    { id: 'enablement',      label: 'Enablement',                      duration: '60min', description: 'Mindtickle training, compliance training, ad-hoc learning' },
    { id: 'month-review',    label: 'Month in Review',                 duration: '30min', description: 'Territory performance, wins/losses analysis, activity performance, share in GTM' },
  ],
};
const ALL_CADENCE_IDS = [
  ...CADENCE_ITEMS.weekly, ...CADENCE_ITEMS.fortnightly, ...CADENCE_ITEMS.monthly,
].map(i => i.id);

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
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.version === SCHEMA_VERSION) return data;
      return migrateData(data);
    }
  } catch (e) { console.warn('Failed to load data:', e); }
  return null;
}

function saveData(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: SCHEMA_VERSION,
      currentWeekKey: state.currentWeekKey,
      settings: state.settings,
      todos: state.todos,
      weeks: state.weeks,
      opportunities: state.opportunities,
      issues: state.issues,
      quickNotes: state.quickNotes,
      archive: state.archive,
    }));
  } catch (e) { console.error('Failed to save:', e); }
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

  return data;
}

function createDefaultState() {
  const today = new Date();
  const weekKey = getISOWeekKey(today);
  const state = {
    currentWeekKey: weekKey,
    settings: { showWeekends: false, carryForwardIncomplete: true, timeAllocationTargets: { ...DEFAULT_TARGETS } },
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
  ALL_CADENCE_IDS.forEach(id => { if (w.cadence[id] === undefined) w.cadence[id] = null; });
  if (!w.meetings) w.meetings = { customerCQ: 0, customerNQ: 0, partner: 0 };
}

let saveTimeout = null;
function debouncedSave(state) {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => saveData(state), 300);
}

// ===================== Alpine Store =====================
document.addEventListener('alpine:init', () => {
  const loaded = loadData();
  const initial = loaded || createDefaultState();
  const realWeekKey = getISOWeekKey(new Date());
  initializeWeek(initial, realWeekKey);
  if (loaded && loaded.currentWeekKey !== realWeekKey) {
    initial.currentWeekKey = realWeekKey;
  }

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
    newOpp: { accountName: '', dealSize: '', type: 'newLogo', stage: '', salesforceLink: '', expectedCloseDate: '', notes: '' },
    expandedOpp: null,
    oppFilter: 'all',
    oppSort: 'expectedCloseDate',
    oppSortAsc: true,
    showAddIssue: false,
    newIssue: { title: '', account: '', type: 'supportCase', link: '', notes: '' },
    expandedIssue: null,
    issueFilter: 'open',
    newIssueNote: '',
    newQuickNote: '',
    notesSearch: '',
    showSettings: false,
    activeNav: 'planner',

    // --- Computed ---
    get isViewingCurrentWeek() { return this.viewingWeekKey === this.currentWeekKey; },
    get viewingWeekDates() {
      const d = getWeekDates(this.viewingWeekKey);
      return this.settings.showWeekends ? d : d.slice(0, 5);
    },
    get viewingWeekDisplay() { return getWeekDisplayRange(this.viewingWeekKey); },

    // ======= PLANNER: todos grouped by day for current viewing week =======
    get weekDays() {
      return this.viewingWeekDates.map(dateStr => ({
        dateStr,
        dayName: getDayName(dateStr),
        dayDate: getDayDate(dateStr),
        isToday: dateStr === this.today,
        todos: this.todos
          .filter(t => t.dueDate === dateStr && !t.completed)
          .sort((a, b) => (PRIORITIES[a.priority]?.sort || 2) - (PRIORITIES[b.priority]?.sort || 2)),
        completedTodos: this.todos
          .filter(t => t.dueDate === dateStr && t.completed)
          .sort((a, b) => (PRIORITIES[a.priority]?.sort || 2) - (PRIORITIES[b.priority]?.sort || 2)),
      }));
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
      this.todos.push({
        id: generateId('todo'),
        title: this.newTodo.title.trim(),
        dueDate: this.newTodo.dueDate || this.today,
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
      const title = prompt('Task title:');
      if (!title || !title.trim()) return;
      this.todos.push({
        id: generateId('todo'),
        title: title.trim(),
        dueDate: dayKey,
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

    // --- Cadence (with timestamps) ---
    get currentCadence() { const w = this.weeks[this.viewingWeekKey]; return w ? w.cadence : {}; },
    get visibleCadenceItems() {
      const items = [];
      CADENCE_ITEMS.weekly.forEach(i => items.push({ ...i, frequency: 'weekly' }));
      if (isFortnightlyWeek(this.viewingWeekKey)) CADENCE_ITEMS.fortnightly.forEach(i => items.push({ ...i, frequency: 'fortnightly' }));
      if (isFirstWeekOfMonth(this.viewingWeekKey)) CADENCE_ITEMS.monthly.forEach(i => items.push({ ...i, frequency: 'monthly' }));
      return items;
    },
    get cadenceProgress() {
      const visible = this.visibleCadenceItems;
      const cadence = this.currentCadence;
      return { completed: visible.filter(i => cadence[i.id]).length, total: visible.length };
    },
    toggleCadence(itemId) {
      const w = this.weeks[this.viewingWeekKey];
      if (!w || !w.cadence) return;
      // Toggle: null -> timestamp, timestamp -> null
      w.cadence[itemId] = w.cadence[itemId] ? null : new Date().toISOString();
      debouncedSave(this);
    },
    getCadenceTime(itemId) {
      const ts = this.currentCadence[itemId];
      if (!ts || typeof ts !== 'string') return null;
      return formatShortTimestamp(ts);
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
      let opps = this.opportunities.filter(o => !o.archived);
      if (this.oppFilter !== 'all') opps = opps.filter(o => o.type === this.oppFilter);
      const sortKey = this.oppSort, asc = this.oppSortAsc;
      opps.sort((a, b) => {
        let va = a[sortKey], vb = b[sortKey];
        if (sortKey === 'dealSize') { va = Number(va) || 0; vb = Number(vb) || 0; }
        if (sortKey === 'priority') { va = va ? 1 : 0; vb = vb ? 1 : 0; }
        if (va < vb) return asc ? -1 : 1; if (va > vb) return asc ? 1 : -1; return 0;
      });
      return opps;
    },
    oppCountByType(type) { return this.opportunities.filter(o => !o.archived && (type === 'all' || o.type === type)).length; },
    submitOpportunity() {
      if (!this.newOpp.accountName.trim()) return;
      this.opportunities.push({
        id: generateId('opp'), accountName: this.newOpp.accountName.trim(),
        dealSize: parseFloat(this.newOpp.dealSize) || 0, type: this.newOpp.type,
        stage: this.newOpp.stage.trim(), salesforceLink: this.newOpp.salesforceLink.trim(),
        expectedCloseDate: this.newOpp.expectedCloseDate, priority: false,
        notes: this.newOpp.notes.trim(), meddpicc: createEmptyMeddpicc(),
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), archived: false,
      });
      this.newOpp = { accountName: '', dealSize: '', type: 'newLogo', stage: '', salesforceLink: '', expectedCloseDate: '', notes: '' };
      this.showAddOpp = false; debouncedSave(this);
    },
    toggleOppPriority(id) { const o = this.opportunities.find(x => x.id === id); if (o) { o.priority = !o.priority; o.updatedAt = new Date().toISOString(); debouncedSave(this); } },
    toggleExpandOpp(id) { this.expandedOpp = this.expandedOpp === id ? null : id; },
    updateOppNotes(id, notes) { const o = this.opportunities.find(x => x.id === id); if (o) { o.notes = notes; o.updatedAt = new Date().toISOString(); debouncedSave(this); } },
    updateOppField(id, field, value) { const o = this.opportunities.find(x => x.id === id); if (o) { o[field] = field === 'dealSize' ? (parseFloat(value) || 0) : value; o.updatedAt = new Date().toISOString(); debouncedSave(this); } },
    updateMeddpicc(id, field, value) { const o = this.opportunities.find(x => x.id === id); if (o) { if (!o.meddpicc) o.meddpicc = createEmptyMeddpicc(); o.meddpicc[field] = value; o.updatedAt = new Date().toISOString(); debouncedSave(this); } },
    getMeddpiccScore(opp) { if (!opp.meddpicc) return 0; return MEDDPICC_FIELDS.filter(f => opp.meddpicc[f.key]?.trim()).length; },
    archiveOpportunity(id) { const o = this.opportunities.find(x => x.id === id); if (o) { o.archived = true; o.updatedAt = new Date().toISOString(); this.expandedOpp = null; debouncedSave(this); } },
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
        notes: this.newIssue.notes.trim() ? [{ id: generateId('note'), text: this.newIssue.notes.trim(), timestamp: new Date().toISOString() }] : [],
      });
      this.newIssue = { title: '', account: '', type: 'supportCase', link: '', notes: '' };
      this.showAddIssue = false; debouncedSave(this);
    },
    toggleExpandIssue(id) { this.expandedIssue = this.expandedIssue === id ? null : id; this.newIssueNote = ''; },
    updateIssueStatus(id, status) { const i = this.issues.find(x => x.id === id); if (i) { i.status = status; i.resolvedAt = status === 'resolved' ? getToday() : null; debouncedSave(this); } },
    addIssueNote(id) { if (!this.newIssueNote.trim()) return; const i = this.issues.find(x => x.id === id); if (i) { i.notes.push({ id: generateId('note'), text: this.newIssueNote.trim(), timestamp: new Date().toISOString() }); this.newIssueNote = ''; debouncedSave(this); } },
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
    s.showSettings = false; s.showAddOpp = false; s.showAddIssue = false;
    s.showAddTodo = false; s.expandedTodo = null; s.expandedOpp = null; s.expandedIssue = null;
  }
  if (e.ctrlKey && e.key === 'ArrowRight') { e.preventDefault(); s.goToWeek(1); }
  if (e.ctrlKey && e.key === 'ArrowLeft') { e.preventDefault(); s.goToWeek(-1); }
});
window.addEventListener('beforeunload', () => { const s = Alpine.store('app'); if (s) saveData(s); });
