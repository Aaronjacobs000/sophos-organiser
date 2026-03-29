/* ============================================================
   Sophos Personal Organiser — Application Logic
   Alpine.js stores, data layer, CRUD, week transitions
   ============================================================ */

// --- Constants ---
const STORAGE_KEY = 'sophos-organiser-data';
const SCHEMA_VERSION = 1;

const CATEGORIES = {
  prospecting:       { label: 'Prospecting',        color: '#2006F7' },
  customerMeetings:  { label: 'Customer Meetings',   color: '#009CFB' },
  quotingProposals:  { label: 'Quoting / Proposals',  color: '#5A00FF' },
  followUps:         { label: 'Follow-ups',          color: '#F29400' },
  partnerEngagement: { label: 'Partner Engagement',   color: '#00F2B3' },
  internalAdmin:     { label: 'Internal / Admin',     color: '#6A889B' },
};

const CATEGORY_KEYS = Object.keys(CATEGORIES);

const OPP_TYPES = {
  newLogo:   { label: 'New Logo',   color: '#00F2B3' },
  expansion: { label: 'Expansion',  color: '#009CFB' },
  renewal:   { label: 'Renewal',    color: '#6A889B' },
};

const ISSUE_TYPES = {
  supportCase:       { label: 'Support Case',       icon: 'headset' },
  customerPainPoint: { label: 'Customer Pain Point', icon: 'alert-triangle' },
  escalation:        { label: 'Escalation',          icon: 'arrow-up-circle' },
  other:             { label: 'Other',               icon: 'circle' },
};

const ISSUE_STATUSES = ['open', 'inProgress', 'resolved'];

const DEFAULT_TARGETS = {
  prospecting: 30,
  customerMeetings: 25,
  quotingProposals: 15,
  followUps: 15,
  partnerEngagement: 10,
  internalAdmin: 5,
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

function getWeekDates(weekKey) {
  const [yearStr, weekStr] = weekKey.split('-W');
  const year = parseInt(yearStr);
  const week = parseInt(weekStr);
  // Jan 4 is always in week 1
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
  const d1 = parseDate(dateStr1);
  const d2 = parseDate(dateStr2);
  return Math.round((d2 - d1) / 86400000);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
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
    const data = {
      version: SCHEMA_VERSION,
      currentWeekKey: state.currentWeekKey,
      settings: state.settings,
      weeks: state.weeks,
      opportunities: state.opportunities,
      issues: state.issues,
      quickNotes: state.quickNotes,
      archive: state.archive,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

function migrateData(data) {
  // Future migration logic
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
  if (state.weeks[weekKey]) return;
  const dates = getWeekDates(weekKey);
  const days = {};
  for (let i = 0; i < 7; i++) {
    days[dates[i]] = { todos: [] };
  }
  state.weeks[weekKey] = { days };
}

// --- Save debouncing ---
let saveTimeout = null;
function debouncedSave(state) {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => saveData(state), 300);
}

// --- Alpine.js App Store ---
document.addEventListener('alpine:init', () => {

  const loaded = loadData();
  const initial = loaded || createDefaultState();

  // Ensure current week exists
  const realWeekKey = getISOWeekKey(new Date());
  if (!initial.weeks[realWeekKey]) {
    initializeWeek(initial, realWeekKey);
  }

  // Auto carry-forward if week changed
  if (loaded && loaded.currentWeekKey !== realWeekKey) {
    performWeekTransition(initial, loaded.currentWeekKey, realWeekKey);
    initial.currentWeekKey = realWeekKey;
  }

  Alpine.store('app', {
    // --- State ---
    ...initial,
    viewingWeekKey: initial.currentWeekKey,
    today: getToday(),

    // UI state
    expandedTodo: null,
    addingTodoDay: null,
    newTodo: { title: '', category: 'prospecting', priority: 'medium' },
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

    // --- Computed Helpers ---
    get isViewingCurrentWeek() {
      return this.viewingWeekKey === this.currentWeekKey;
    },

    get isViewingArchive() {
      return this.viewingWeekKey !== this.currentWeekKey && !!this.archive[this.viewingWeekKey];
    },

    get viewingWeekDates() {
      const dates = getWeekDates(this.viewingWeekKey);
      return this.settings.showWeekends ? dates : dates.slice(0, 5);
    },

    get viewingWeekDisplay() {
      return getWeekDisplayRange(this.viewingWeekKey);
    },

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

    // Activity tracker
    get activityStats() {
      const week = this.weeks[this.currentWeekKey];
      if (!week) return [];
      const counts = {};
      let total = 0;
      CATEGORY_KEYS.forEach(k => counts[k] = 0);
      Object.values(week.days).forEach(day => {
        day.todos.forEach(t => {
          if (counts[t.category] !== undefined) {
            counts[t.category]++;
            total++;
          }
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
        return {
          key: k,
          label: CATEGORIES[k].label,
          color: CATEGORIES[k].color,
          count,
          pct,
          target,
          status,
        };
      });
    },

    get nudges() {
      const msgs = [];
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0=Sun, 3=Wed
      if (dayOfWeek < 3 && dayOfWeek > 0) return msgs; // Mon/Tue: no nudges yet

      this.activityStats.forEach(s => {
        if (s.status === 'critical') {
          if (s.key === 'prospecting') {
            msgs.push('Your prospecting activity is light this week. New business drives 85% of your commission — consider blocking time for outreach.');
          } else if (s.key === 'customerMeetings') {
            msgs.push('No customer meetings scheduled? Face time builds pipeline velocity.');
          } else if (s.key === 'quotingProposals') {
            msgs.push('Quoting activity is low. Any deals ready for a proposal?');
          }
        }
      });
      return msgs;
    },

    // Filtered/sorted opportunities
    get filteredOpportunities() {
      let opps = this.opportunities.filter(o => !o.archived);
      if (this.oppFilter !== 'all') {
        opps = opps.filter(o => o.type === this.oppFilter);
      }
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

    // Filtered issues
    get filteredIssues() {
      if (this.issueFilter === 'all') return this.issues;
      return this.issues.filter(i => i.status === this.issueFilter);
    },

    // Filtered quick notes
    get filteredNotes() {
      let notes = [...this.quickNotes];
      if (this.notesSearch.trim()) {
        const q = this.notesSearch.toLowerCase();
        notes = notes.filter(n => n.text.toLowerCase().includes(q));
      }
      // Pinned first, then reverse chronological
      notes.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
      return notes;
    },

    // --- Todo Methods ---
    startAddTodo(dayKey) {
      this.addingTodoDay = dayKey;
      this.newTodo = { title: '', category: 'prospecting', priority: 'medium' };
      setTimeout(() => {
        const input = document.querySelector(`[data-day="${dayKey}"] .add-todo-input`);
        if (input) input.focus();
      }, 50);
    },

    cancelAddTodo() {
      this.addingTodoDay = null;
    },

    submitTodo(dayKey) {
      if (!this.newTodo.title.trim()) return;
      const week = this.weeks[this.viewingWeekKey];
      if (!week || !week.days[dayKey]) return;
      const todo = {
        id: generateId('todo'),
        title: this.newTodo.title.trim(),
        notes: '',
        priority: this.newTodo.priority,
        category: this.newTodo.category,
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString(),
        order: week.days[dayKey].todos.length,
      };
      week.days[dayKey].todos.push(todo);
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

    toggleExpandTodo(todoId) {
      this.expandedTodo = this.expandedTodo === todoId ? null : todoId;
    },

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
      const toTodos = week.days[toDay].todos;
      toTodos.splice(newIndex, 0, todo);
      // Reorder
      fromTodos.forEach((t, i) => t.order = i);
      toTodos.forEach((t, i) => t.order = i);
      debouncedSave(this);
    },

    // --- Opportunity Methods ---
    submitOpportunity() {
      if (!this.newOpp.accountName.trim()) return;
      const opp = {
        id: generateId('opp'),
        accountName: this.newOpp.accountName.trim(),
        dealSize: parseFloat(this.newOpp.dealSize) || 0,
        type: this.newOpp.type,
        stage: this.newOpp.stage.trim(),
        salesforceLink: this.newOpp.salesforceLink.trim(),
        expectedCloseDate: this.newOpp.expectedCloseDate,
        priority: false,
        notes: this.newOpp.notes.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        archived: false,
      };
      this.opportunities.push(opp);
      this.newOpp = { accountName: '', dealSize: '', type: 'newLogo', stage: '', salesforceLink: '', expectedCloseDate: '', notes: '' };
      this.showAddOpp = false;
      debouncedSave(this);
    },

    toggleOppPriority(oppId) {
      const opp = this.opportunities.find(o => o.id === oppId);
      if (opp) { opp.priority = !opp.priority; opp.updatedAt = new Date().toISOString(); debouncedSave(this); }
    },

    toggleExpandOpp(oppId) {
      this.expandedOpp = this.expandedOpp === oppId ? null : oppId;
    },

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

    // --- Issue Methods ---
    submitIssue() {
      if (!this.newIssue.title.trim()) return;
      const issue = {
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
      };
      this.issues.push(issue);
      this.newIssue = { title: '', account: '', type: 'supportCase', link: '', notes: '' };
      this.showAddIssue = false;
      debouncedSave(this);
    },

    toggleExpandIssue(issueId) {
      this.expandedIssue = this.expandedIssue === issueId ? null : issueId;
      this.newIssueNote = '';
    },

    updateIssueStatus(issueId, status) {
      const issue = this.issues.find(i => i.id === issueId);
      if (!issue) return;
      issue.status = status;
      if (status === 'resolved') issue.resolvedAt = getToday();
      else issue.resolvedAt = null;
      debouncedSave(this);
    },

    addIssueNote(issueId) {
      if (!this.newIssueNote.trim()) return;
      const issue = this.issues.find(i => i.id === issueId);
      if (!issue) return;
      issue.notes.push({
        id: generateId('note'),
        text: this.newIssueNote.trim(),
        timestamp: new Date().toISOString(),
      });
      this.newIssueNote = '';
      debouncedSave(this);
    },

    deleteIssue(issueId) {
      this.issues = this.issues.filter(i => i.id !== issueId);
      if (this.expandedIssue === issueId) this.expandedIssue = null;
      debouncedSave(this);
    },

    getIssueDaysOpen(issue) {
      const end = issue.resolvedAt || getToday();
      return daysBetween(issue.dateOpened, end);
    },

    // --- Quick Notes Methods ---
    addQuickNote() {
      if (!this.newQuickNote.trim()) return;
      this.quickNotes.push({
        id: generateId('qn'),
        text: this.newQuickNote.trim(),
        timestamp: new Date().toISOString(),
        pinned: false,
      });
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
      if (!this.weeks[this.viewingWeekKey]) {
        initializeWeek(this, this.viewingWeekKey);
      }
      debouncedSave(this);
    },

    goToCurrentWeek() {
      this.viewingWeekKey = this.currentWeekKey;
    },

    // --- Settings ---
    updateTarget(key, value) {
      this.settings.timeAllocationTargets[key] = parseInt(value) || 0;
      debouncedSave(this);
    },

    toggleWeekends() {
      this.settings.showWeekends = !this.settings.showWeekends;
      debouncedSave(this);
    },

    toggleCarryForward() {
      this.settings.carryForwardIncomplete = !this.settings.carryForwardIncomplete;
      debouncedSave(this);
    },

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
          const data = JSON.parse(e.target.result);
          if (!data.version || !data.weeks) {
            alert('Invalid backup file format.');
            return;
          }
          // Replace all data
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
        } catch (err) {
          alert('Failed to import: ' + err.message);
        }
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

    // --- Scroll Navigation ---
    scrollTo(sectionId) {
      this.activeNav = sectionId;
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
  });
});

// --- Week Transition (runs before store init) ---
function performWeekTransition(state, oldWeekKey, newWeekKey) {
  const oldWeek = state.weeks[oldWeekKey];
  if (!oldWeek) return;

  const completed = [];
  const incomplete = [];
  const carriedIds = [];

  Object.values(oldWeek.days).forEach(day => {
    day.todos.forEach(todo => {
      if (todo.completed) completed.push(todo);
      else incomplete.push(todo);
    });
  });

  // Build archive entry
  const categoryCounts = {};
  CATEGORY_KEYS.forEach(k => categoryCounts[k] = 0);
  [...completed, ...incomplete].forEach(t => {
    if (categoryCounts[t.category] !== undefined) categoryCounts[t.category]++;
  });

  state.archive[oldWeekKey] = {
    completedTodos: completed,
    carriedForward: incomplete.map(t => t.id),
    weekSummary: {
      totalTodos: completed.length + incomplete.length,
      completed: completed.length,
      categoryCounts,
    },
  };

  // Initialize new week
  initializeWeek(state, newWeekKey);

  // Carry forward incomplete to Monday of new week
  if (state.settings.carryForwardIncomplete && incomplete.length > 0) {
    const newDates = getWeekDates(newWeekKey);
    const mondayKey = newDates[0];
    incomplete.forEach(todo => {
      const clone = {
        ...todo,
        id: generateId('todo'),
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString(),
      };
      state.weeks[newWeekKey].days[mondayKey].todos.push(clone);
      carriedIds.push(todo.id);
    });
  }

  // Prune old archives (keep last 12 weeks)
  const archiveKeys = Object.keys(state.archive).sort();
  while (archiveKeys.length > 12) {
    delete state.archive[archiveKeys.shift()];
  }
}

// --- SortableJS Initialization (called from Alpine x-init) ---
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
      const fromDay = evt.from.dataset.dayKey;
      const toDay = evt.to.dataset.dayKey;
      const todoId = evt.item.dataset.todoId;
      const newIndex = evt.newIndex;
      Alpine.store('app').moveTodo(fromDay, toDay, todoId, newIndex);
    },
  });
}

// --- Keyboard Shortcuts ---
document.addEventListener('keydown', (e) => {
  const store = Alpine.store('app');
  if (!store) return;

  // Escape: close modals/forms
  if (e.key === 'Escape') {
    store.showSettings = false;
    store.showAddOpp = false;
    store.showAddIssue = false;
    store.addingTodoDay = null;
    store.expandedTodo = null;
    store.expandedOpp = null;
    store.expandedIssue = null;
  }

  // Ctrl+ArrowRight/Left: week navigation
  if (e.ctrlKey && e.key === 'ArrowRight') { e.preventDefault(); store.goToWeek(1); }
  if (e.ctrlKey && e.key === 'ArrowLeft') { e.preventDefault(); store.goToWeek(-1); }
});

// --- Save on page unload ---
window.addEventListener('beforeunload', () => {
  const store = Alpine.store('app');
  if (store) saveData(store);
});
