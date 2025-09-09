# Repository Guidelines

## Project Structure & Modules
- src/client: React app (Vite). Entrypoint `src/index.jsx`, routes in `src/routes.jsx`, feature modules under `src/modules/*` (e.g., `notes`, `weight`).
- src/server: Express + Sequelize. Feature modules live in `src/modules/<feature>/{model,routes,seed}.js`.
- src/Dockerfile: Multi-stage build: Vite build → Node server serving `public/`.
- Assets/styles live under `src/client/src` (e.g., `styles.css`). No dedicated `tests/` folder yet.

## Build, Test, and Development
- Client dev: `cd src/client && npm i && npm run dev` — runs Vite on `5173` with proxy to `8080`.
- Server dev: `cd src/server && npm i && PORT=8080 node src/index.js` — starts API + static server.
- Docker: from repo root `docker build -t web-baby -f src/Dockerfile .` then `docker run -p 8080:8080 --env-file .env web-baby`.
- Config: Server reads `.env` via `dotenv`. Provide `DATABASE_URL` or `DB_HOST/DB_NAME[/DB_USER/DB_PASSWORD/DB_PORT]`.

## Coding Style & Naming
- Indentation: 2 spaces; keep semicolons; prefer ESM imports with explicit extensions (`.js`, `.jsx`).
- React: Components PascalCase (e.g., `Header.jsx`). Keep module-local files in `src/modules/<feature>/`.
- Server: Keep the `{model,routes,seed}.js` pattern per feature. Route paths under `/api/<feature>/...`.
- Lint/format: No enforced toolchain; match surrounding style. Keep files small and cohesive.

## Testing Guidelines
- Current state: No automated tests. Do manual checks:
  - Client pages render; nav highlights; charts load.
  - CRUD flows for milking/weight/height/notes via UI and `/api/...` endpoints.
- If adding tests, colocate as `*.test.{js,jsx}` next to source and document the runner in package.json.

## Commit & Pull Requests
- Commits in history are short and imperative (e.g., `fix js errs`, `add height`). Prefer clearer scope:
  - Example: `weight: add WHO percentile line`, `notes: fix edit modal focus`.
- PRs: small, focused, with:
  - Description of change and rationale; link issues if any.
  - Screenshots/GIFs for UI changes.
  - DB migrations or env var notes (if applicable).
  - How-to-verify steps (dev commands + expected result).

## Security & Configuration
- Treat `.env` as secret. Never commit credentials.
- Minimal DB rights are sufficient; app auto-creates tables on start.
