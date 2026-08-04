# Colppy Sales Backend

NestJS API for the Colppy business case: sales management, CSV import, and data grids powered by a shared **TableBack** query layer.

## Stack

- **Runtime:** Node.js, TypeScript
- **Framework:** NestJS 11
- **ORM:** TypeORM 0.3 with PostgreSQL
- **Validation:** class-validator / class-transformer
- **API docs:** Swagger (OpenAPI) at `{SERVICE_NAME}/documentation`

## Setup

1. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

2. Install dependencies and start PostgreSQL (defaults in `.env.example`).

3. Run the API:

   ```bash
   npm install
   npm run start:dev
   ```

On startup the app creates the target database if missing, runs pending **migrations/seeds**, and syncs PostgreSQL **functions/triggers** (see below).

## Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SERVICE_NAME` | Global URL prefix for all routes and Swagger path | `colppy-sales` |
| `NODE_ENV` | Environment label (`development`, etc.) | `development` |
| `PORT` | HTTP port | `3000` |
| `DEBUG` | When `true`, verbose Nest logger and extra error debug in the exception filter | `false` |
| `COLPPY_DATABASE_HOST` | PostgreSQL host | — |
| `COLPPY_DATABASE_PORT` | PostgreSQL port | `5432` |
| `COLPPY_DATABASE_USERNAME` | DB user | `postgres` |
| `COLPPY_DATABASE_PASSWORD` | DB password | — |
| `COLPPY_DATABASE_NAME` | Application database name | `colppy_business_case` |

## Folder structure

```
src/
├── main.ts                 # Bootstrap: pipes, filters, interceptors, Swagger, CORS
├── app.module.ts           # Root module: config, DB, feature modules, logging middleware
├── config/
│   ├── configuration.ts    # Maps env vars to Nest ConfigService shape
│   └── constants.ts        # Shared HTTP response templates (bilingual es/en messages)
├── common/
│   ├── dto/common.dto.ts   # QueryParamsDTO for TableBack list endpoints
│   ├── decorators/         # Swagger TableBack queries, query transformers, skip response wrap
│   ├── interfaces/         # Importer strategy contract
│   └── types/              # Importer column tuple type
├── datasources/
│   ├── colppy.datasource.ts      # TypeORM root module (COLPPY connection)
│   ├── datasource.sync.service.ts # Applies DB functions/triggers when definitions change
│   ├── datasource.table.back.ts  # TableBack filter/pagination engine
│   └── colppy/
│       ├── entities/       # TypeORM entities
│       ├── migrations/     # Schema migrations (run on startup)
│       ├── seeds/          # Data seeds (TypeORM migrations in seeds folder)
│       ├── colppy.functions.ts  # PL/pgSQL function definitions
│       └── colppy.triggers.ts   # Trigger definitions linked to functions
├── filters/
│   └── http.exception.filter.ts  # Normalizes errors to { success, message, messages }
├── interceptors/
│   └── response.formatter.interceptor.ts  # Wraps success payloads
├── middlewares/
│   └── logging.ts          # Request/response timing logs
├── modules/
│   ├── sales/              # CRUD + table-back for sales
│   ├── customers/          # table-back + findOrCreate for imports/manual sales
│   ├── products/           # table-back + findOrCreate
│   ├── payment_methods/    # List active methods for UI/import
│   └── importer/           # CSV import orchestration (sales strategy)
└── utils/
    ├── service.error.ts              # Typed domain HTTP errors
    └── validation.exception.factory.ts  # Flattens validation errors for 400 responses
```

## API endpoints summary

Base path: `/{SERVICE_NAME}/` (e.g. `/colppy-sales/`). URI versioning is enabled globally; controllers use the default version unless annotated.

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `sales/table-back` | Paginated/filterable sales grid with joined customer, product, payment method |
| `POST` | `sales` | Create sale (resolves customer/product by name, validates payment method) |
| `PUT` | `sales/:sale_id_public` | Partial update by public UUID |
| `GET` | `customers/table-back` | Customer grid (active by default unless filtered) |
| `GET` | `products/table-back` | Product grid (active by default unless filtered) |
| `GET` | `payment-methods` | Active payment methods for dropdowns |
| `POST` | `importer` | Import sales rows from parsed CSV payload |

**Swagger:** `http://localhost:{PORT}/{SERVICE_NAME}/documentation` (local server entry shown in development).

### Success response shape

Most routes are wrapped by `ResponseFormatInterceptor`:

```json
{ "success": true, "status": true, "error": false, "data": { ... } }
```

Errors use `HttpExceptionFilter` with bilingual `messages` when applicable.

### TableBack query parameters

Used by `*/table-back` endpoints (`QueryParamsDTO`):

- `filters` — JSON tree with `AND` / `OR` and field operators (`contains`, `is`, `in`, `gte`, etc.)
- `pagination`, `page`, `per_page`
- `order`, `order_by`
- `deleted` — `exclude` (default), `include`, or `only` soft-deleted rows
- `search_field`, `search_value` — ILIKE across comma-separated columns
- `add_attribute` — extra SELECT columns/expressions

Services build a TypeORM `QueryBuilder`, pass it to `TableBack.filterQuery()`, and return `{ rows, count }` (count set when pagination is enabled).

## Importer

`POST /importer` accepts a body shaped by `PostImporterBodyDTO`:

- `entity` — currently only `sales`
- `columns` — `[columnName, options][]` matching CSV headers
- `rows` — array of row value arrays
- `dryRun` — validate only, no DB writes
- `file_name` — optional label for logs

`ImporterService` selects a strategy by `entity`. `SalesImportStrategy`:

1. Maps payment method names (case-insensitive) to IDs from seeded methods.
2. Validates each row (required fields, dates, amounts, duplicate `id_venta` in file and DB).
3. On non–dry-run, creates customers/products via `findOrCreateByName` and inserts sales.

Row results use `CREATED` or `ERROR` with per-row messages; the service aggregates a summary and user-facing message.

`importer.utils.ts` provides `insertInBatches` for bulk inserts (utility for future strategies).

## Migrations and seeds

TypeORM runs migrations from `datasources/colppy/migrations/` and `datasources/colppy/seeds/` automatically when the COLPPY data source initializes (`synchronize: false`).

| Order | File | Purpose |
|-------|------|---------|
| 1 | `1785783600000.create.extension.uuid.ossp.ts` | Enables `uuid-ossp` for public UUID columns |
| 2 | `1785783660000.create.table.customers.ts` | `customers` table |
| 3 | `1785783720000.create.table.products.ts` | `products` table |
| 4 | `1785783780000.create.table.payment.methods.ts` | `payment_methods` table |
| 5 | `1785783840000.create.table.sales.ts` | `sales` table with FKs |
| 6 | `1785787935000.seed.table.payment.methods.ts` | Seeds `transferencia`, `tarjeta`, `efectivo` |

After migrations, `DatabaseSyncService` ensures PL/pgSQL objects match `colppy.functions.ts` / `colppy.triggers.ts`, storing SHA-256 hashes in `function_versions` to avoid redundant DDL.

The `set_sales_code` trigger auto-generates `sale_code` (`V-{n}`) when inserting sales without a code (manual API creates); imports supply `sale_code` from CSV `id_venta`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Watch mode |
| `npm run build` | Compile to `dist/` |
| `npm run start:prod` | Run compiled `dist/main.js` |
| `npm run lint` | ESLint |
| `npm test` | Jest unit tests |
