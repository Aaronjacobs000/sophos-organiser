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
- `opportunities` — deal tracker (account, size, type, Salesforce link, stage)
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

## Testing

Manual testing in Chrome/Edge:
1. Add/complete/delete/drag todos across day columns
2. Add opportunities, filter by type, sort, check Salesforce links
3. Add issues, append notes, change status
4. Quick notes: add, search, pin, delete
5. Navigate weeks (Ctrl+←/→), verify carry-forward of incomplete items
6. Export JSON, clear data, re-import
7. Check Settings modal toggles and target adjustments
