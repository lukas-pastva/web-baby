# Web-Baby 👶🍼

A lightweight full-stack app that helps new parents log and visualise their baby’s milk intake.

*Front-end*: React 18 + Vite | *Back-end*: Express + Sequelize (MariaDB) | *CI/CD*: GitHub Actions → Docker Hub  
Everything ships in **one Docker image** so you can run it anywhere with
| Variable          | Required | Example                                                    |
|-------------------|----------|------------------------------------------------------------|
| **DATABASE_URL**  | ✓*       | `mysql://user:pass@db:3306/web_baby`                       |
| — or —            |          |                                                            |
| **DB_HOST**       | ✓        | `mariadb.default.svc.cluster.local`                        |
| **DB_NAME**       | ✓        | `web_baby`                                                 |
| DB_USER           |          | `webbaby`                                                  |
| DB_PASSWORD       |          | `hunter2`                                                  |
| DB_PORT           |          | `3306`                                                     |
| **BIRTH_TS**      |          | `2025-04-28T07:42:00Z` *(ISO)* or `1714288920000` *(ms)*   |
| **CHILD_NAME**    |          | `Alice`                                                    |
| **CHILD_SURNAME** |          | `Smith`                                                    |

\* Provide either `DATABASE_URL` **or** the individual `DB_*` variables.

When `BIRTH_TS` is set the UI automatically shows the baby’s age and picks the
matching daily-intake recommendation.
