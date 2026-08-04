# Colppy Sales — Frontend

Single-page React application for managing sales: paginated list with search and filters, CSV import/export, create/edit sale, read-only detail, and a lightweight sales dashboard. It talks to the NestJS backend under `VITE_BASE_URL`.

## Stack

| Layer | Choice |
| --- | --- |
| Build | [Vite](https://vitejs.dev/) 6 |
| UI | React 18 |
| Styling | Tailwind CSS 3 + CSS modules for feature screens |
| Env loading | [env-cmd](https://www.npmjs.com/package/env-cmd) (`config/.env.local`) |
| Routing | Minimal — root `App` renders the sales module (no React Router in this repo) |

## Setup

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Ensure the backend is running and reachable at the URL configured below.

Other scripts:

- `npm run build` — production build (uses the same env file)
- `npm run preview` — serve the built assets locally
- `npm run lint` — ESLint on `js` / `jsx`

## Environment variables

Create or edit `config/.env.local`:

```env
VITE_BASE_URL=http://localhost:3000/colppy-sales/
```

| Variable | Purpose |
| --- | --- |
| `VITE_BASE_URL` | Base URL for all API calls (must include trailing path segment the backend expects, e.g. `/colppy-sales/`). Relative paths in services are appended to this value. |

If `VITE_BASE_URL` is missing, the HTTP layer shows an error toast and does not call the server.

## Folder structure

```
frontend/
  config/.env.local     # Local API base URL (not committed with secrets in real projects)
  src/
    main.jsx              # React entry: mounts App, global styles
    routes/               # App shell (Layout + SalesList)
    api/                  # Shared fetch wrapper (query.get/post/put/delete)
    services/             # Re-exports domain API helpers from modules
    modules/sales/        # Sales feature: screen, modals, CSV, dashboard, API calls
    components/           # Shared layout, forms, and UI (TableBack, Modal, Button, …)
    hooks/                # useValidator, useWindowSize
    utils/                # Toasts, currency, table-back filter encoding, localStorage cache
    icons/                # SVG icon components (barrel: icons/index.js)
    styles/               # Global reset, main, toast CSS
```

### `src/api`

Central HTTP client. Every request:

1. Prefixes relative URLs with `VITE_BASE_URL`
2. Sends JSON (`Content-Type: application/json`) unless `multipart: true`
3. Parses JSON and normalizes success/error into `{ success, data, error, message, status }`
4. Shows error toasts by default (`showErrorAlert: true`)

See `api/query.js` and `resolveApiMessage` for error message extraction.

### `src/modules/sales`

| Area | Role |
| --- | --- |
| `screens/sales_list.jsx` | Main page: table, toolbar actions, wires modals |
| `components/` | `NewSaleModal`, `SaleDetailModal`, `SalesImporter`, `SalesDashboardModal` |
| `functions/` | CSV parse/validate/export, table config, form mappers, dashboard aggregates |
| `service/` | Backend endpoints: `sales`, `sales/table-back`, `importer`, `payment-methods` |

### `src/components`

| Area | Role |
| --- | --- |
| `layout/` | App chrome: sidebar + main content area |
| `forms/Inputs/` | Controlled inputs: text, select, date, file |
| `ui/Tables/TableBack/` | Server-driven table: pagination, search, filters, row actions |
| `ui/Modals`, `ui/Button`, `ui/Box`, `ui/Skeleton` | Building blocks |

### `src/utils`

Filter query serialization for table-back (`filtersTableBack.js`), `formatCurrency`, toast helper (`alerts.js`), and persisted table UI state (`storage.js`).

## Main features

### Sales list (`SalesList`)

- **Data**: `GET sales/table-back` with encoded `filters`, pagination, and search (via `TableBack` + `SALES_FILTERS`).
- **Row actions**: View detail, edit (opens `NewSaleModal` in edit mode).
- **Toolbar**: Dashboard, Import CSV, New sale, Export CSV (respects current filters/search).

### CSV export

`exportSalesCsv` loads all matching rows through `getSalesTableBackForExport` (same filters as the table, no pagination). Falls back to currently loaded table rows if the request fails. Downloads a UTF-8 CSV with BOM matching import column names.

### CSV import

`SalesImporter` validates file size and required columns client-side, then `POST importer` with entity `sales`. Supports dry-run style feedback via backend result rows; refreshes the table on success.

Example/template CSV: `downloadExampleSalesCsv` from the importer UI.

### New sale / edit

`NewSaleModal` loads payment methods from `GET payment-methods`, validates with `useValidator`, and calls `POST sales` or `PUT sales/:id`.

### Dashboard

`SalesDashboardModal` uses table query context (filters + search) to fetch or reuse rows, then `buildSalesDashboardData` / `compareSalesDays` for totals, last-N-day bars, and day-over-day comparison.

## API layer (how requests flow)

```
Screen / Modal / TableBack hook
        ↓
modules/sales/service/*.js  (or query directly in useTableBack)
        ↓
api/query.js  →  fetch(VITE_BASE_URL + path)
        ↓
Backend (colppy-sales)
```

**Conventions:**

- Services return the normalized object from `query`, not raw `Response`.
- Pass `{ showErrorAlert: false }` when the caller handles errors (e.g. export fallback).
- Table-back list: `config.service` e.g. `'sales/table-back'`; hook builds query string from `appliedFilters` and `searchTerm`.
- Importer body shape: built by `buildSalesImportPayload` in `service/importer.js`.

## Backend endpoints used

| Method | Path | Used by |
| --- | --- | --- |
| GET | `sales/table-back` | Table list, export, dashboard data |
| POST | `sales` | Create sale |
| PUT | `sales/:saleIdPublic` | Update sale |
| GET | `payment-methods` | New/edit sale form |
| POST | `importer` | CSV import |

Paths are relative to `VITE_BASE_URL`.
