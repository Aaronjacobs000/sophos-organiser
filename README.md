# Sophos Personal Organiser

A personal productivity dashboard built for Sophos Territory Account Executives. Plan your week, track deals, monitor issues, and stay on top of your "Day in the Life" cadence — all from your browser.

Your data is saved to a **file on your machine** (`data.json`). Store the app folder in OneDrive and your data syncs across devices automatically.

---

## Getting Started (2 minutes)

### Step 1: Get the files

**Option A — Download ZIP:**
1. Go to the GitHub repo page
2. Click the green **Code** button, then **Download ZIP**
3. Extract the ZIP to your **OneDrive** folder (e.g., `OneDrive\Sophos Organiser`)

**Option B — Using Git:**
```
cd "OneDrive"
git clone https://github.com/Aaronjacobs000/sophos-organiser.git "Sophos Organiser"
```

### Step 2: Launch it

**Windows:** Double-click **`Start Organiser.bat`**

**Mac:** Double-click **`Start Organiser.command`**

That's it. A small terminal window will open (keep it open) and your browser will launch the organiser.

When you're done for the day, close the terminal window.

> **Mac users:** The first time you double-click the `.command` file, macOS may say it's from an unidentified developer. Right-click the file, choose **Open**, then click **Open** in the dialog. You only need to do this once.

---

## How It Works

When you launch the organiser, it runs a tiny local web server on your machine (PowerShell on Windows, Python on Mac — both built in, no extra software to install). Your browser connects to this server at `http://localhost:8080`.

Every time you make a change, the organiser automatically saves to a `data.json` file in the same folder as the app. Because this folder lives in your OneDrive, your data syncs to the cloud automatically.

**Your data is yours.** It never leaves your machine (except via OneDrive sync, which you control).

---

## How to Update (without losing your data)

Your data lives in `data.json`, which is separate from the app files. Updating the app files will **never** erase your data.

### If you downloaded the ZIP:

1. Download the latest ZIP from GitHub
2. Extract it to the **same folder** (overwrite when prompted)
3. **Do not delete `data.json`** — that's your data
4. Relaunch `Start Organiser.bat`

### If you used Git:

Double-click `update.bat` or run:
```
cd "Sophos Organiser"
git pull
```
Then relaunch `Start Organiser.bat`.

---

## What is in the Organiser

### Weekly Planner
Your week at a glance — Monday to Friday columns with draggable to-do items, cadence activities, and next steps from your opportunities and watch list. Everything you need to do that day in one view.

### To-Do List
A full task manager with due dates, priorities (Urgent/High/Medium/Low), categories, recurring tasks (daily/weekly/monthly/annual/custom), and timestamped notes. Tasks appear on the weekly planner when their due date falls in the current week.

### Weekly Cadence
Your "Day in the Life" activities as a checklist — weekly, fortnightly, and monthly rhythm items from the handbook. Fully customizable in Settings. Each item shows when it was completed (timestamp), so you can see if they were done throughout the week or all at once.

### Opportunities
Track your priority deals with account name, deal size, type (New Logo / Expansion / Renewal), stage, Salesforce link, close date, and open/closed status. Add timestamped notes and set next step dates that appear on the planner. MEDDPICC qualification fields for deals over $30K.

### Watch List
Track open issues — support cases, customer pain points, escalations. Add timestamped notes, set next step dates, and mark resolved when done. Next steps appear on the planner.

### Quick Notes
A scratchpad for anything — call notes, reminders, quick thoughts. Pin important notes to the top.

### Activity Tracker (sidebar)
See how your week's tasks break down by category vs. targets. Meeting counter tracks customer and partner meetings against weekly goals.

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

Your data is automatically saved to `data.json` in the app folder. If that folder is in OneDrive, you already have a cloud backup.

You can also use the **Export** button (download icon in the header) to save a timestamped backup file anywhere you like.

---

## Troubleshooting

**Windows: "Start Organiser.bat" doesn't work / nothing happens**
- Make sure you're on Windows 10 or 11 (PowerShell is built in)
- Right-click the .bat file and choose "Run as administrator" if needed
- If port 8080 is in use, the terminal will show an error — close whatever else is using that port

**Mac: "Start Organiser.command" won't open**
- Right-click the file, choose **Open**, then click **Open** in the dialog (first time only)
- If you get "python3 not found", open Terminal and run: `xcode-select --install`

**The page says it can't connect**
- Make sure the terminal window is still open
- Try refreshing the browser page

**My data disappeared!**
- Check that `data.json` exists in the app folder
- If you opened `index.html` directly (without the launcher), data may have been saved to browser localStorage instead — always use the launcher for file-based storage

**Can I use this on multiple machines?**
- Yes — store the folder in OneDrive. The `data.json` file syncs between machines.
- Just make sure you close the organiser on one machine before opening on another (to avoid sync conflicts).

**Can I switch between a Windows PC and a Mac?**
- Yes. The `data.json` file is the same format on both. OneDrive syncs it. Just use the right launcher for each OS.

---

Built with care for the Sophos ANZ field team.
