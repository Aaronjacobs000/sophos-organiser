# Sophos Personal Organiser

A personal productivity dashboard built for Sophos Territory Account Executives. Plan your week, track deals, monitor issues, and stay on top of your "Day in the Life" cadence — all from your browser, with zero setup required.

Your data stays on **your machine** (saved in your browser). Nothing is sent anywhere.

---

## Getting Started (2 minutes)

### Option A: Download and Open (easiest)

1. Go to the GitHub repo page
2. Click the green **Code** button, then **Download ZIP**
3. Extract the ZIP to a folder on your computer (e.g., `Desktop\sophos-organiser`)
4. Open the folder and **double-click `index.html`**
5. Bookmark the page in your browser — that is your organiser

### Option B: Using Git (if you have it)

Open a terminal and run:

```
git clone https://github.com/Aaronjacobs000/sophos-organiser.git
cd sophos-organiser
start index.html
```

---

## How to Update (without losing your data)

Your data is saved in **your browser**, not in the app files. Updating the app files will **never** erase your data.

### If you downloaded the ZIP:

1. Download the latest ZIP from GitHub
2. Extract it to the **same folder** as before (overwrite files when prompted)
3. Refresh the page in your browser

### If you used Git:

Double-click `update.bat` in the app folder, or run:

```
cd sophos-organiser
git pull
```

Then refresh the page.

---

## What is in the Organiser

### Weekly Planner
Your week at a glance — Monday to Friday columns with draggable to-do items. Each task has a category (Customer Meetings, Prospecting, Pipeline, etc.), priority level, and optional notes. Incomplete tasks automatically carry forward to next week.

### Weekly Cadence
Your "Day in the Life" activities as a checklist. These are the weekly, fortnightly, and monthly rhythm activities from the handbook:
- **Weekly**: SE standup, P-Matrix planning, Focus 30 review, territory plan review, deal reg call downs, coat tailing, prospecting, SDR follow-up, forecast prep
- **Fortnightly**: Renewal cadence, CSM cadence, channel cadence
- **Monthly**: Week 2/8 deal review, enablement, month in review

### Meeting Tracker
Track your meetings against targets:
- 7 current quarter customer meetings per week
- 3 next quarter customer meetings per week
- 2 partner meetings per week

### Opportunity Tracker
Your priority deals with account name, deal size, type (New Logo / Expansion / Renewal), stage, Salesforce link, and close date. Deals nearing close are highlighted. Deals over $30K include MEDDPICC tracking fields.

### Watch List
Open items you need to monitor — support cases, customer pain points, escalations. Add timestamped notes as things progress. Items stay visible until you resolve them.

### Quick Notes
A scratchpad for anything — call notes, reminders, quick thoughts. Pin important notes to the top. Search to find old notes.

### Activity Tracker (sidebar)
See how your week's tasks break down by category vs. targets. Mid-week nudges appear if key activities like prospecting or customer meetings are underweight.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + →` | Next week |
| `Ctrl + ←` | Previous week |
| `Esc` | Close any open panel or form |
| `Ctrl + Enter` | Submit a quick note |

---

## Backing Up Your Data

Click the **download icon** in the top-right header to export a JSON backup file. To restore, click the **upload icon** and select your backup file.

You can also manage backups in **Settings** (gear icon).

---

## Troubleshooting

**My data disappeared!**
Your data is stored in the browser you used. If you switch browsers or clear browser data, you will need to import a backup. Tip: export a backup weekly.

**The page looks broken.**
Make sure all the files are in the same folder: `index.html`, `app.js`, `style.css`, plus the `lib/` and `assets/` folders.

**Can I use this on my phone?**
It is designed for desktop (widescreen), but it will work in a pinch on a tablet or phone browser.

---

Built with care for the Sophos ANZ field team.
