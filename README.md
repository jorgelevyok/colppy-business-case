# Colppy Sales — Business Case

CRUD de ventas con grilla paginada/filtrable, alta/edición manual, import/export CSV y un dashboard liviano.

**Stack:** NestJS + TypeORM + PostgreSQL | React + Vite + Tailwind

## Cómo correrlo

1. Levantá PostgreSQL y copiá `backend/.env.example` → `backend/.env`.
2. Backend:

   ```bash
   cd backend && npm install && npm run start:dev
   ```

   API: `http://localhost:3000/colppy-sales/` · Swagger: `.../documentation`

3. Frontend (revisá `VITE_BASE_URL` en `frontend/config/.env.local`):

   ```bash
   cd frontend && npm install && npm run dev
   ```

   UI: `http://localhost:5173`

CSVs de ejemplo en `data/`.

## Tests

Desde la raíz del repo (backend + frontend):

```bash
npm test
```

O por carpeta:

```bash
cd backend && npm test
cd frontend && npm test
```

- **Backend (Jest):** tests de endpoints (`sales`, `customers`, `products`, `payment-methods`, `importer`) con servicios mockeados, más unit tests de `SalesService` e `ImporterService`.
- **Frontend (Vitest):** unit tests de dashboard, formatters, validaciones del form de ventas y armado de filtros TableBack.

## Decisiones

- Backend modular (Nest) con TypeORM/migrations + seeds al arrancar, para que el caso levante solo.
- Grilla genérica **TableBack** (filtros, paginación y sort del lado del server) en vez de armar algo ad-hoc solo para ventas.
- Import CSV con strategy por entidad: valida fila a fila, reporta errores parciales y no corta todo el archivo.
- Dashboard calculado en frontend sobre un set acotado; no armé un módulo de analytics aparte.

## Qué prioricé

Flujo completo usable: listar → filtrar → crear/editar → importar CSV con feedback claro → exportar. Claridad de dominio (cliente, producto, medio de pago, venta) antes que features “de producto” extras.

## Qué dejé afuera a propósito

Auth/roles, colas o jobs para imports masivos, charts de librería, tests e2e con DB real, Docker compose, multi-tenant y un endpoint dedicado de reporting. Para el alcance del case no sumaban tanto como el flujo feliz bien cerrado.

## Performance — riesgos y cómo medirlos

- **Import CSV grande:** hoy procesa en request; con miles de filas puede timeout o saturar memoria. Mediría tiempo de `POST /importer` y uso de heap con CSVs de 1k / 10k / 50k filas; si crece, batch + cola.
- **Listado con joins/filtros:** riesgo de full scan si faltan índices o el count es caro. Mediría latency p95 de `GET /sales` con filtros típicos (`EXPLAIN ANALYZE` + logs de duración).
- **Dashboard en cliente:** si se trae demasiado volumen, el browser se traba. Mediría payload y tiempo de render; el techo natural es un aggregate en SQL.

## Stack utilizado

Elegí Node.js con NestJS, TypeORM y PostgreSQL por su arquitectura sólida y mantenible, y React con Vite y Tailwind CSS por su rapidez de desarrollo, rendimiento y facilidad para construir una interfaz moderna.
