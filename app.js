/* ============================================================
   Sophos Personal Organiser — Application Logic
   Aligned to ANZ Field "Day in the Life" Handbook v1.2
   ============================================================ */

const STORAGE_KEY = 'sophos-organiser-data';
const SCHEMA_VERSION = 2;

// --- Categories (aligned to handbook activity blocks) ---
const CATEGORIES = {
  customerMeetings:    { label: 'Customer Meetings',     color: '#5A00FF' },
  partnerEngagement:   { label: 'Partner Engagement',     color: '#00F2B3' },
  prospecting:         { label: 'Prospecting',            color: '#2006F7' },
  pipelineForecasting: { label: 'Pipeline & Forecasting', color: '#009CFB' },
  territoryPlanning:   { label: 'Territory Planning',     color: '#F29400' },
  enablementAdmin:     { label: 'Enablement / Admin',     color: '#6A889B' },
};
const CATEGORY_KEYS = Object.keys(CATEGORIES);

// --- Opportunity Types ---
const OPP_TYPES = {
  newLogo:   { label: 'New Logo',   color: '#00F2B3' },
  expansion: { label: 'Expansion',  color: '#009CFB' },
  renewal:   { label: 'Renewal',    color: '#6A889B' },
};

const OPP_STAGES = [
  'Prospecting',
  'Discovery / Qualification',
  'Technical Validation',
  'Proposal / Quote',
  'Negotiation',
  'Closed Won',
  'Closed Lost',
];

// --- Issue Types ---
const ISSUE_TYPES = {
  supportCase:       { label: 'Support Case',       icon: 'headset' },
  customerPainPoint: { label: 'Customer Pain Point', icon: 'alert-triangle' },
  escalation:        { label: 'Escalation',          icon: 'arrow-up-circle' },
  other:             { label: 'Other',               icon: 'circle' },
};
const ISSUE_STATUSES = ['open', 'inProgress', 'resolved'];

// --- Weekly Cadence (from Day in the Life handbook) ---
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
  ...CADENCE_ITEMS.weekly,
  ...CADENCE_ITEMS.fortnightly,
  ...CADENCE_ITEMS.monthly,
].map(i => i.id);

// --- Meeting Targets (from handbook: 10 customer + 2 partner/week) ---
const MEETING_TARGETS = {
  customerCQ: 7,
  customerNQ: 3,
  partner: 2,
};

// --- MEDDPICC Fields (for opportunities +$30K ACV) ---
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
  customerMeetings: 35,
  partnerEngagement: 15,
  prospecting: 15,
  pipelineForecasting: 15,
  territoryPlanning: 10,
  enablementAdmin: 10,
};

// --- Utility Functions ---
function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
}

function getToday() {
  const d = new Date();
  return formatDate(d);
}

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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

function getISOWeekNumber(weekKey) {
  return parseInt(weekKey.split('-W')[1]);
}

function getWeekDates(weekKey) {
  const [yearStr, weekStr] = weekKey.split('-W');
  const year = parseInt(yearStr);
  const week = parseInt(weekStr);
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7;
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - dayOfWeek + 1 + (week - 1) * 7);
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(formatDate(d));
  }
  return dates;
}

function getWeekDisplayRange(weekKey) {
  const dates = getWeekDates(weekKey);
  const start = parseDate(dates[0]);
  const end = parseDate(dates[4]);
  const opts = { day: 'numeric', month: 'short' };
  return `${start.toLocaleDateString('en-AU', opts)} – ${end.toLocaleDateString('en-AU', opts)} ${start.getFullYear()}`;
}

function getDayName(dateStr) {
  return parseDate(dateStr).toLocaleDateString('en-AU', { weekday: 'short' });
}

function getDayDate(dateStr) {
  return parseDate(dateStr).getDate();
}

function daysBetween(dateStr1, dateStr2) {
  return Math.round((parseDate(dateStr2) - parseDate(dateStr1)) / 86400000);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);
}

function formatTimestamp(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
}

function navigateWeek(currentKey, delta) {
  const dates = getWeekDates(currentKey);
  const monday = parseDate(dates[0]);
  monday.setDate(monday.getDate() + delta * 7);
  return getISOWeekKey(monday);
}

function isFortnightlyWeek(weekKey) {
  return getISOWeekNumber(weekKey) % 2 === 0;
}

function isFirstWeekOfMonth(weekKey) {
  const dates = getWeekDates(weekKey);
  const monday = parseDate(dates[0]);
  return monday.getDate() <= 7;
}

function createEmptyMeddpicc() {
  const m = {};
  MEDDPICC_FIELDS.forEach(f => m[f.key] = '');
  return m;
}

// --- Data Persistence ---
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.version === SCHEMA_VERSION) return data;
      return migrateData(data);
    }
  } catch (e) {
    console.warn('Failed to load data, starting fresh:', e);
  }
  return null;
}

function saveData(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: SCHEMA_VERSION,
      currentWeekKey: state.currentWeekKey,
      settings: state.settings,
      weeks: state.weeks,
      opportunities: state.opportunities,
      issues: state.issues,
      quickNotes: state.quickNotes,
      archive: state.archive,
    }));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

function migrateData(data) {
  if (data.version === 1) {
    // v1 -> v2: New categories, add cadence/meetings to weeks, add MEDDPICC to opps
    const oldCategoryMap = {
      'prospecting': 'prospecting',
      'customerMeetings': 'customerMeetings',
      'quotingProposals': 'pipelineForecasting',
      'followUps': 'pipelineForecasting',
      'partnerEngagement': 'partnerEngagement',
      'internalAdmin': 'enablementAdmin',
    };

    // Migrate todos in all weeks
    if (data.weeks) {
      Object.values(data.weeks).forEach(week => {
        // Add cadence and meetings if missing
        if (!week.cadence) {
          week.cadence = {};
          ALL_CADENCE_IDS.forEach(id => week.cadence[id] = false);
        }
        if (!week.meetings) {
          week.meetings = { customerCQ: 0, customerNQ: 0, partner: 0 };
        }
        // Remap todo categories
        if (week.days) {
          Object.values(week.days).forEach(day => {
            if (day.todos) {
              day.todos.forEach(todo => {
                todo.category = oldCategoryMap[todo.category] || todo.category;
              });
            }
          });
        }
      });
    }

    // Add MEDDPICC to opportunities
    if (data.opportunities) {
      data.opportunities.forEach(opp => {
        if (!opp.meddpicc) opp.meddpicc = createEmptyMeddpicc();
      });
    }

    // Migrate settings targets
    if (data.settings && data.settings.timeAllocationTargets) {
      const old = data.settings.timeAllocationTargets;
      data.settings.timeAllocationTargets = {
        customerMeetings: old.customerMeetings || 35,
        partnerEngagement: old.partnerEngagement || 15,
        prospecting: old.prospecting || 15,
        pipelineForecasting: (old.quotingProposals || 0) + (old.followUps || 0) || 15,
        territoryPlanning: 10,
        enablementAdmin: old.internalAdmin || 10,
      };
    }

    data.version = 2;
  }
  return data;
}

function createDefaultState() {
  const today = new Date();
  const weekKey = getISOWeekKey(today);
  const state = {
    currentWeekKey: weekKey,
    settings: {
      showWeekends: false,
      carryForwardIncomplete: true,
      timeAllocationTargets: { ...DEFAULT_TARGETS },
    },
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
  if (state.weeks[weekKey]) {
    // Ensure cadence and meetings exist on existing weeks
    if (!state.weeks[weekKey].cadence) {
      state.weeks[weekKey].cadence = {};
      ALL_CADENCE_IDS.forEach(id => state.weeks[weekKey].cadence[id] = false);
    }
    if (!state.weeks[weekKey].meetings) {
      state.weeks[weekKey].meetings = { customerCQ: 0, customerNQ: 0, partner: 0 };
    }
    return;
  }
  const dates = getWeekDates(weekKey);
  const days = {};
  for (let i = 0; i < 7; i++) {
    days[dates[i]] = { todos: [] };
  }
  const cadence = {};
  ALL_CADENCE_IDS.forEach(id => cadence[id] = false);
  state.weeks[weekKey] = { days, cadence, meetings: { customerCQ: 0, customerNQ: 0, partner: 0 } };
}

// --- Debounced Save ---
let saveTimeout = null;
function debouncedSave(state) {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => saveData(state), 300);
}

// --- Alpine Store ---
document.addEventListener('alpine:init', () => {
  const loaded = loadData();
  const initial = loaded || createDefaultState();

  const realWeekKey = getISOWeekKey(new Date());
  initializeWeek(initial, realWeekKey);

  if (loaded && loaded.currentWeekKey !== realWeekKey) {
    performWeekTransition(initial, loaded.currentWeekKey, realWeekKey);
    initial.currentWeekKey = realWeekKey;
  }

  Alpine.store('app', {
    ...initial,
    viewingWeekKey: initial.currentWeekKey,
    today: getToday(),

    // UI state
    expandedTodo: null,
    addingTodoDay: null,
    newTodo: { title: '', category: 'customerMeetings', priority: 'medium' },
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
    get isViewingArchive() { return this.viewingWeekKey !== this.currentWeekKey && !!this.archive[this.viewingWeekKey]; },

    get viewingWeekDates() {
      const dates = getWeekDates(this.viewingWeekKey);
      return this.settings.showWeekends ? dates : dates.slice(0, 5);
    },

    get viewingWeekDisplay() { return getWeekDisplayRange(this.viewingWeekKey); },

    get weekDays() {
      const week = this.weeks[this.viewingWeekKey];
      if (!week) return [];
      return this.viewingWeekDates.map(dateStr => ({
        dateStr,
        dayName: getDayName(dateStr),
        dayDate: getDayDate(dateStr),
        isToday: dateStr === this.today,
        todos: (week.days[dateStr] && week.days[dateStr].todos) || [],
      }));
    },

    // --- Meeting Tracker ---
    get currentMeetings() {
      const week = this.weeks[this.currentWeekKey];
      return week ? week.meetings : { customerCQ: 0, customerNQ: 0, partner: 0 };
    },

    get totalCustomerMeetings() {
      const m = this.currentMeetings;
      return m.customerCQ + m.customerNQ;
    },

    get totalMeetings() {
      const m = this.currentMeetings;
      return m.customerCQ + m.customerNQ + m.partner;
    },

    adjustMeeting(type, delta) {
      const week = this.weeks[this.currentWeekKey];
      if (!week) return;
      week.meetings[type] = Math.max(0, (week.meetings[type] || 0) + delta);
      debouncedSave(this);
    },

    // --- Cadence ---
    get currentCadence() {
      const week = this.weeks[this.viewingWeekKey];
      return week ? week.cadence : {};
    },

    get visibleCadenceItems() {
      const items = [];
      CADENCE_ITEMS.weekly.forEach(item => items.push({ ...item, frequency: 'weekly' }));
      if (isFortnightlyWeek(this.viewingWeekKey)) {
        CADENCE_ITEMS.fortnightly.forEach(item => items.push({ ...item, frequency: 'fortnightly' }));
      }
      if (isFirstWeekOfMonth(this.viewingWeekKey)) {
        CADENCE_ITEMS.monthly.forEach(item => items.push({ ...item, frequency: 'monthly' }));
      }
      return items;
    },

    get cadenceProgress() {
      const visible = this.visibleCadenceItems;
      const cadence = this.currentCadence;
      const completed = visible.filter(i => cadence[i.id]).length;
      return { completed, total: visible.length };
    },

    toggleCadence(itemId) {
      const week = this.weeks[this.viewingWeekKey];
      if (!week || !week.cadence) return;
      week.cadence[itemId] = !week.cadence[itemId];
      debouncedSave(this);
    },

    // --- Activity Tracker ---
    get activityStats() {
      const week = this.weeks[this.currentWeekKey];
      if (!week) return [];
      const counts = {};
      let total = 0;
      CATEGORY_KEYS.forEach(k => counts[k] = 0);
      Object.values(week.days).forEach(day => {
        day.todos.forEach(t => {
          if (counts[t.category] !== undefined) { counts[t.category]++; total++; }
        });
      });
      const targets = this.settings.timeAllocationTargets;
      return CATEGORY_KEYS.map(k => {
        const count = counts[k];
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        const target = targets[k] || 0;
        let status = 'on-track';
        if (total > 0 && pct < target * 0.5) status = 'critical';
        else if (total > 0 && pct < target) status = 'below';
        return { key: k, label: CATEGORIES[k].label, color: CATEGORIES[k].color, count, pct, target, status };
      });
    },

    get nudges() {
      const msgs = [];
      const dow = new Date().getDay();
      if (dow >= 1 && dow <= 2) return msgs; // Mon/Tue: no nudges yet

      const m = this.currentMeetings;
      const totalCust = m.customerCQ + m.customerNQ;
      if (dow >= 3 && totalCust < 4) {
        msgs.push('You have fewer than 4 customer meetings logged this week. Target is 10 — consider reaching out to progress current quarter deals.');
      }
      if (dow >= 4 && m.partner < 1) {
        msgs.push('No partner meetings this week yet. Target is 2/week — channel engagement drives deal registrations.');
      }

      this.activityStats.forEach(s => {
        if (s.status === 'critical') {
          if (s.key === 'prospecting') {
            msgs.push('Prospecting activity is light. New business drives 85% of commission — block time for new logo pursuit and coat tailing.');
          } else if (s.key === 'customerMeetings') {
            msgs.push('Customer meeting activity is low. Aim for 2 customer meetings + prep per day.');
          } else if (s.key === 'pipelineForecasting') {
            msgs.push('Pipeline management activity is low. Is your Clari forecast up to date? Review top 15 deals.');
          }
        }
      });

      const cp = this.cadenceProgress;
      if (dow >= 4 && cp.total > 0 && cp.completed < cp.total * 0.5) {
        msgs.push(`Only ${cp.completed} of ${cp.total} cadence activities completed this week. Review your weekly rhythm.`);
      }

      return msgs;
    },

    // --- Filtered Opportunities ---
    get filteredOpportunities() {
      let opps = this.opportunities.filter(o => !o.archived);
      if (this.oppFilter !== 'all') opps = opps.filter(o => o.type === this.oppFilter);
      const sortKey = this.oppSort;
      const asc = this.oppSortAsc;
      opps.sort((a, b) => {
        let va = a[sortKey], vb = b[sortKey];
        if (sortKey === 'dealSize') { va = Number(va) || 0; vb = Number(vb) || 0; }
        if (sortKey === 'priority') { va = va ? 1 : 0; vb = vb ? 1 : 0; }
        if (va < vb) return asc ? -1 : 1;
        if (va > vb) return asc ? 1 : -1;
        return 0;
      });
      return opps;
    },

    oppCountByType(type) {
      if (type === 'all') return this.opportunities.filter(o => !o.archived).length;
      return this.opportunities.filter(o => !o.archived && o.type === type).length;
    },

    get filteredIssues() {
      if (this.issueFilter === 'all') return this.issues;
      return this.issues.filter(i => i.status === this.issueFilter);
    },

    get filteredNotes() {
      let notes = [...this.quickNotes];
      if (this.notesSearch.trim()) {
        const q = this.notesSearch.toLowerCase();
        notes = notes.filter(n => n.text.toLowerCase().includes(q));
      }
      notes.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
      return notes;
    },

    // --- Todo CRUD ---
    startAddTodo(dayKey) {
      this.addingTodoDay = dayKey;
      this.newTodo = { title: '', category: 'customerMeetings', priority: 'medium' };
      setTimeout(() => {
        const input = document.querySelector(`[data-day="${dayKey}"] .add-todo-input`);
        if (input) input.focus();
      }, 50);
    },

    cancelAddTodo() { this.addingTodoDay = null; },

    submitTodo(dayKey) {
      if (!this.newTodo.title.trim()) return;
      const week = this.weeks[this.viewingWeekKey];
      if (!week || !week.days[dayKey]) return;
      week.days[dayKey].todos.push({
        id: generateId('todo'),
        title: this.newTodo.title.trim(),
        notes: '',
        priority: this.newTodo.priority,
        category: this.newTodo.category,
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString(),
        order: week.days[dayKey].todos.length,
      });
      this.newTodo = { title: '', category: this.newTodo.category, priority: 'medium' };
      this.addingTodoDay = null;
      debouncedSave(this);
    },

    toggleTodo(dayKey, todoId) {
      const week = this.weeks[this.viewingWeekKey];
      if (!week) return;
      const todo = week.days[dayKey].todos.find(t => t.id === todoId);
      if (!todo) return;
      todo.completed = !todo.completed;
      todo.completedAt = todo.completed ? new Date().toISOString() : null;
      debouncedSave(this);
    },

    toggleExpandTodo(todoId) { this.expandedTodo = this.expandedTodo === todoId ? null : todoId; },

    updateTodoNotes(dayKey, todoId, notes) {
      const week = this.weeks[this.viewingWeekKey];
      if (!week) return;
      const todo = week.days[dayKey].todos.find(t => t.id === todoId);
      if (todo) { todo.notes = notes; debouncedSave(this); }
    },

    updateTodoCategory(dayKey, todoId, category) {
      const week = this.weeks[this.viewingWeekKey];
      if (!week) return;
      const todo = week.days[dayKey].todos.find(t => t.id === todoId);
      if (todo) { todo.category = category; debouncedSave(this); }
    },

    updateTodoPriority(dayKey, todoId, priority) {
      const week = this.weeks[this.viewingWeekKey];
      if (!week) return;
      const todo = week.days[dayKey].todos.find(t => t.id === todoId);
      if (todo) { todo.priority = priority; debouncedSave(this); }
    },

    deleteTodo(dayKey, todoId) {
      const week = this.weeks[this.viewingWeekKey];
      if (!week) return;
      const day = week.days[dayKey];
      if (!day) return;
      day.todos = day.todos.filter(t => t.id !== todoId);
      if (this.expandedTodo === todoId) this.expandedTodo = null;
      debouncedSave(this);
    },

    moveTodo(fromDay, toDay, todoId, newIndex) {
      const week = this.weeks[this.viewingWeekKey];
      if (!week) return;
      const fromTodos = week.days[fromDay].todos;
      const idx = fromTodos.findIndex(t => t.id === todoId);
      if (idx === -1) return;
      const [todo] = fromTodos.splice(idx, 1);
      week.days[toDay].todos.splice(newIndex, 0, todo);
      fromTodos.forEach((t, i) => t.order = i);
      week.days[toDay].todos.forEach((t, i) => t.order = i);
      debouncedSave(this);
    },

    // --- Opportunity CRUD ---
    submitOpportunity() {
      if (!this.newOpp.accountName.trim()) return;
      this.opportunities.push({
        id: generateId('opp'),
        accountName: this.newOpp.accountName.trim(),
        dealSize: parseFloat(this.newOpp.dealSize) || 0,
        type: this.newOpp.type,
        stage: this.newOpp.stage.trim(),
        salesforceLink: this.newOpp.salesforceLink.trim(),
        expectedCloseDate: this.newOpp.expectedCloseDate,
        priority: false,
        notes: this.newOpp.notes.trim(),
        meddpicc: createEmptyMeddpicc(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        archived: false,
      });
      this.newOpp = { accountName: '', dealSize: '', type: 'newLogo', stage: '', salesforceLink: '', expectedCloseDate: '', notes: '' };
      this.showAddOpp = false;
      debouncedSave(this);
    },

    toggleOppPriority(oppId) {
      const opp = this.opportunities.find(o => o.id === oppId);
      if (opp) { opp.priority = !opp.priority; opp.updatedAt = new Date().toISOString(); debouncedSave(this); }
    },

    toggleExpandOpp(oppId) { this.expandedOpp = this.expandedOpp === oppId ? null : oppId; },

    updateOppNotes(oppId, notes) {
      const opp = this.opportunities.find(o => o.id === oppId);
      if (opp) { opp.notes = notes; opp.updatedAt = new Date().toISOString(); debouncedSave(this); }
    },

    updateOppField(oppId, field, value) {
      const opp = this.opportunities.find(o => o.id === oppId);
      if (opp) {
        if (field === 'dealSize') value = parseFloat(value) || 0;
        opp[field] = value;
        opp.updatedAt = new Date().toISOString();
        debouncedSave(this);
      }
    },

    updateMeddpicc(oppId, field, value) {
      const opp = this.opportunities.find(o => o.id === oppId);
      if (opp) {
        if (!opp.meddpicc) opp.meddpicc = createEmptyMeddpicc();
        opp.meddpicc[field] = value;
        opp.updatedAt = new Date().toISOString();
        debouncedSave(this);
      }
    },

    getMeddpiccScore(opp) {
      if (!opp.meddpicc) return 0;
      return MEDDPICC_FIELDS.filter(f => opp.meddpicc[f.key] && opp.meddpicc[f.key].trim()).length;
    },

    archiveOpportunity(oppId) {
      const opp = this.opportunities.find(o => o.id === oppId);
      if (opp) { opp.archived = true; opp.updatedAt = new Date().toISOString(); this.expandedOpp = null; debouncedSave(this); }
    },

    getOppCloseDaysLeft(opp) {
      if (!opp.expectedCloseDate) return null;
      return daysBetween(this.today, opp.expectedCloseDate);
    },

    getOppUrgency(opp) {
      const days = this.getOppCloseDaysLeft(opp);
      if (days === null) return '';
      if (days <= 7) return 'urgent-critical';
      if (days <= 14) return 'urgent-warning';
      return '';
    },

    // --- Issue CRUD ---
    submitIssue() {
      if (!this.newIssue.title.trim()) return;
      this.issues.push({
        id: generateId('iss'),
        title: this.newIssue.title.trim(),
        account: this.newIssue.account.trim(),
        type: this.newIssue.type,
        status: 'open',
        link: this.newIssue.link.trim(),
        dateOpened: getToday(),
        resolvedAt: null,
        notes: this.newIssue.notes.trim() ? [{
          id: generateId('note'),
          text: this.newIssue.notes.trim(),
          timestamp: new Date().toISOString(),
        }] : [],
      });
      this.newIssue = { title: '', account: '', type: 'supportCase', link: '', notes: '' };
      this.showAddIssue = false;
      debouncedSave(this);
    },

    toggleExpandIssue(issueId) { this.expandedIssue = this.expandedIssue === issueId ? null : issueId; this.newIssueNote = ''; },

    updateIssueStatus(issueId, status) {
      const issue = this.issues.find(i => i.id === issueId);
      if (!issue) return;
      issue.status = status;
      issue.resolvedAt = status === 'resolved' ? getToday() : null;
      debouncedSave(this);
    },

    addIssueNote(issueId) {
      if (!this.newIssueNote.trim()) return;
      const issue = this.issues.find(i => i.id === issueId);
      if (!issue) return;
      issue.notes.push({ id: generateId('note'), text: this.newIssueNote.trim(), timestamp: new Date().toISOString() });
      this.newIssueNote = '';
      debouncedSave(this);
    },

    deleteIssue(issueId) {
      this.issues = this.issues.filter(i => i.id !== issueId);
      if (this.expandedIssue === issueId) this.expandedIssue = null;
      debouncedSave(this);
    },

    getIssueDaysOpen(issue) {
      return daysBetween(issue.dateOpened, issue.resolvedAt || getToday());
    },

    // --- Quick Notes ---
    addQuickNote() {
      if (!this.newQuickNote.trim()) return;
      this.quickNotes.push({ id: generateId('qn'), text: this.newQuickNote.trim(), timestamp: new Date().toISOString(), pinned: false });
      this.newQuickNote = '';
      debouncedSave(this);
    },

    togglePinNote(noteId) {
      const note = this.quickNotes.find(n => n.id === noteId);
      if (note) { note.pinned = !note.pinned; debouncedSave(this); }
    },

    deleteNote(noteId) {
      this.quickNotes = this.quickNotes.filter(n => n.id !== noteId);
      debouncedSave(this);
    },

    // --- Week Navigation ---
    goToWeek(delta) {
      this.viewingWeekKey = navigateWeek(this.viewingWeekKey, delta);
      initializeWeek(this, this.viewingWeekKey);
      debouncedSave(this);
    },

    goToCurrentWeek() { this.viewingWeekKey = this.currentWeekKey; },

    // --- Settings ---
    updateTarget(key, value) {
      this.settings.timeAllocationTargets[key] = parseInt(value) || 0;
      debouncedSave(this);
    },

    toggleWeekends() { this.settings.showWeekends = !this.settings.showWeekends; debouncedSave(this); },
    toggleCarryForward() { this.settings.carryForwardIncomplete = !this.settings.carryForwardIncomplete; debouncedSave(this); },

    // --- Export / Import ---
    exportData() {
      const data = {
        version: SCHEMA_VERSION,
        currentWeekKey: this.currentWeekKey,
        settings: this.settings,
        weeks: this.weeks,
        opportunities: this.opportunities,
        issues: this.issues,
        quickNotes: this.quickNotes,
        archive: this.archive,
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sophos-organiser-backup-${getToday()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },

    importData(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          let data = JSON.parse(e.target.result);
          if (!data.version || !data.weeks) { alert('Invalid backup file format.'); return; }
          if (data.version < SCHEMA_VERSION) data = migrateData(data);
          this.currentWeekKey = data.currentWeekKey;
          this.viewingWeekKey = data.currentWeekKey;
          this.settings = data.settings;
          this.weeks = data.weeks;
          this.opportunities = data.opportunities || [];
          this.issues = data.issues || [];
          this.quickNotes = data.quickNotes || [];
          this.archive = data.archive || {};
          saveData(this);
          alert('Data imported successfully.');
        } catch (err) { alert('Failed to import: ' + err.message); }
      };
      reader.readAsText(file);
    },

    clearAllData() {
      if (!confirm('Are you sure you want to clear all data? This cannot be undone.')) return;
      localStorage.removeItem(STORAGE_KEY);
      const fresh = createDefaultState();
      Object.assign(this, fresh);
      this.viewingWeekKey = fresh.currentWeekKey;
      saveData(this);
    },

    scrollTo(sectionId) {
      this.activeNav = sectionId;
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
  });
});

// --- Week Transition ---
function performWeekTransition(state, oldWeekKey, newWeekKey) {
  const oldWeek = state.weeks[oldWeekKey];
  if (!oldWeek) return;

  const completed = [], incomplete = [];
  Object.values(oldWeek.days).forEach(day => {
    day.todos.forEach(todo => {
      (todo.completed ? completed : incomplete).push(todo);
    });
  });

  const categoryCounts = {};
  CATEGORY_KEYS.forEach(k => categoryCounts[k] = 0);
  [...completed, ...incomplete].forEach(t => {
    if (categoryCounts[t.category] !== undefined) categoryCounts[t.category]++;
  });

  state.archive[oldWeekKey] = {
    completedTodos: completed,
    carriedForward: incomplete.map(t => t.id),
    meetings: oldWeek.meetings || { customerCQ: 0, customerNQ: 0, partner: 0 },
    cadenceCompleted: oldWeek.cadence ? Object.values(oldWeek.cadence).filter(Boolean).length : 0,
    weekSummary: { totalTodos: completed.length + incomplete.length, completed: completed.length, categoryCounts },
  };

  initializeWeek(state, newWeekKey);

  if (state.settings.carryForwardIncomplete && incomplete.length > 0) {
    const mondayKey = getWeekDates(newWeekKey)[0];
    incomplete.forEach(todo => {
      state.weeks[newWeekKey].days[mondayKey].todos.push({
        ...todo,
        id: generateId('todo'),
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString(),
      });
    });
  }

  const archiveKeys = Object.keys(state.archive).sort();
  while (archiveKeys.length > 12) delete state.archive[archiveKeys.shift()];
}

// --- SortableJS ---
function initSortable(el, dayKey) {
  if (el._sortable) el._sortable.destroy();
  el._sortable = new Sortable(el, {
    group: 'todos',
    animation: 150,
    ghostClass: 'sortable-ghost',
    dragClass: 'sortable-drag',
    handle: '.todo-card',
    draggable: '.todo-card',
    onEnd(evt) {
      Alpine.store('app').moveTodo(evt.from.dataset.dayKey, evt.to.dataset.dayKey, evt.item.dataset.todoId, evt.newIndex);
    },
  });
}

// --- Keyboard Shortcuts ---
document.addEventListener('keydown', (e) => {
  const store = Alpine.store('app');
  if (!store) return;
  if (e.key === 'Escape') {
    store.showSettings = false;
    store.showAddOpp = false;
    store.showAddIssue = false;
    store.addingTodoDay = null;
    store.expandedTodo = null;
    store.expandedOpp = null;
    store.expandedIssue = null;
  }
  if (e.ctrlKey && e.key === 'ArrowRight') { e.preventDefault(); store.goToWeek(1); }
  if (e.ctrlKey && e.key === 'ArrowLeft') { e.preventDefault(); store.goToWeek(-1); }
});

window.addEventListener('beforeunload', () => {
  const store = Alpine.store('app');
  if (store) saveData(store);
});
