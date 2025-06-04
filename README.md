# Web-Baby 👶🍼

A lightweight full-stack app that helps new parents **log, visualise and
annotate** their baby’s daily life — milk intake, weight -- and now free-form
**notes** (vaccinations, milestones, probiotics …).

| Variable          | Required | Example                                   |
|-------------------|----------|-------------------------------------------|
| **DATABASE_URL**  | ✓\*      | `mysql://user:pass@db:3306/web_baby`      |
| — or —            |          |                                           |
| **DB_HOST**       | ✓        | `mariadb.default.svc.cluster.local`       |
| **DB_NAME**       | ✓        | `web_baby`                                |
| DB_USER           |          | `webbaby`                                 |
| DB_PASSWORD       |          | `hunter2`                                 |
| DB_PORT           |          | `3306`                                    |
| **BIRTH_TS**      |          | `2025-04-28T07:42:00Z` *(ISO)*            |

\* Provide either `DATABASE_URL` **or** the individual `DB_*` variables.

### What’s inside 📦
| Page          | What it does                                                             |
|---------------|--------------------------------------------------------------------------|
| **Today**     | Log feeds, see stacked chart and running total for the current day.      |
| **All days**  | Infinite-scroll timeline with per-day collapsible cards + two charts.    |
| **Weight**    | Record daily weight, view chart against WHO growth standards.            |
| **Notes**     | Free-text dated notes (vaccinations, supplements, milestones …).         |
| **Config**    | Accent colour (boy / girl), light/dark/auto mode, birth details, hide feed types. |
| **Help**      | App overview, shortcuts and FAQ.                                         |

All settings live in **MariaDB / MySQL** — tables are auto-created on first run.

### Local dev ▶️
```bash
# front-end
cd src/client
npm i
npm run dev      # http://localhost:5173  (proxy → 8080)

# back-end
cd ../server
npm i
PORT=8080 node src/index.js
