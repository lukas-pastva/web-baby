# Web-Baby 👶🍼

A lightweight full-stack app that helps new parents log and visualise their
baby’s milk intake.

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
| **CHILD_NAME**    |          | `Alice`                                   |
| **CHILD_SURNAME** |          | `Smith`                                   |
| **BABY_THEME**    |          | `boy` (default) or `girl` 🎀 **NEW**      |

\* Provide either `DATABASE_URL` **or** the individual `DB_*` variables.

When `BABY_THEME` is set to `girl` the whole UI switches to a pink accent
palette; omit it (or set `boy`) for the teal palette.
