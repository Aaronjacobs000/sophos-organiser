# Sophos Personal Organiser

Self-hosted productivity dashboard for Sophos Territory Account Executives (TAEs).

## Tech Stack

- **Alpine.js v3** — reactive UI framework (vendored in `lib/`)
- **SortableJS** — drag-and-drop todo reordering (vendored in `lib/`)
- **Vanilla CSS** — custom properties for Sophos brand theming
- **localStorage** — all data persistence (no backend)

## Running

```bash
# Option 1: Python HTTP server
python -m http.server 8000
# Then open http://localhost:8000

# Option 2: Just open index.html directly in Chrome/Edge
```

## File Structure

```
index.html     — Main SPA markup, Alpine directives, SVG icon sprite
app.js         — Alpine stores, data model, CRUD logic, week transitions
style.css      — All styles, CSS custom properties, layout
lib/           — Vendored Alpine.js and SortableJS (offline-ready)
assets/        — Sophos logo SVGs
```

## Data Model

All data lives in `localStorage['sophos-organiser-data']` as a single JSON object containing:
- `weeks` — weekly planner data with per-day todo arrays
- `weeks[key].cadence` — weekly cadence checklist completion state
- `weeks[key].meetings` — meeting counter (customerCQ, customerNQ, partner)
- `opportunities` — deal tracker (account, size, type, Salesforce link, stage, MEDDPICC)
- `issues` — watch list items with timestamped notes
- `quickNotes` — scratchpad entries
- `archive` — completed week summaries
- `settings` — display prefs and activity allocation targets

## Conventions

- Use Alpine stores (`Alpine.store('app')`) for all shared state
- CSS custom properties for all brand colors (defined in `:root`)
- No build step — everything works by serving static files
- All persistence goes through `debouncedSave()` for performance
- IDs follow `{prefix}_{timestamp}_{random}` pattern
- Brand colors from Sophos guidelines: Dark Blue `#001A47`, Sophos Blue `#2006F7`, Cyber Blue `#00EDFF`, Cyber Green `#00F2B3`
- Schema version is tracked — bump `SCHEMA_VERSION` and add migration logic in `migrateData()` when changing the data model

## Handbook Alignment

Categories and cadence items are aligned to the ANZ Field "Day in the Life" Handbook v1.2:
- **Categories**: Customer Meetings, Partner Engagement, Prospecting, Pipeline & Forecasting, Territory Planning, Enablement/Admin
- **Weekly Cadence**: SE standup, P-Matrix, Focus 30, territory review, deal reg, coat tailing, prospecting, SDR follow-up, forecast prep
- **Fortnightly**: Renewal cadence, CSM cadence, Channel cadence
- **Monthly**: Deal review, enablement, month in review
- **Meeting Targets**: 7 CQ + 3 NQ customer meetings + 2 partner meetings per week
- **MEDDPICC**: Shown on opportunities with deal size >= $30K ACV

## Testing

Manual testing in Chrome/Edge:
1. Add/complete/delete/drag todos across day columns
2. Check/uncheck cadence items, verify fortnightly/monthly visibility
3. Increment/decrement meeting counters
4. Add opportunities, filter by type, sort, check Salesforce links
5. Expand a $30K+ deal and fill MEDDPICC fields
6. Add issues, append notes, change status
7. Quick notes: add, search, pin, delete
8. Navigate weeks (Ctrl+←/→), verify carry-forward of incomplete items
9. Export JSON, clear data, re-import
10. Check Settings modal toggles and target adjustments
