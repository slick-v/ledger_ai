# Ledger AI

A personal **expense & income tracker** with a clean, mobile-first UI. Track what you
spend and earn across Cash / UPI / Bank accounts, set category budgets, and add expenses
in seconds — by tapping, or by describing them in plain English with AI.

> **Status: v2** — everything in v1 plus category **budgets**, a **daily-spend** bar, a
> merged **Quick + AI** add card, and **natural-language expense entry** (Groq).

---

## Features

**Core**
- 🔐 **Authentication** — email/password register & login with JWT bearer tokens
- 💸 **Expenses** — full CRUD, 10 categories, merchant, notes, date, account type
- 💰 **Income** — full CRUD, 3 categories (Salary / Investment / Other)
- 📊 **Dashboard** — balance, total & monthly income/expenses, per-account balances, recent transactions
- 🏦 **Accounts** — Cash, UPI, Bank
- 🛡️ **Admin panel** — app-wide stats and per-user breakdown (email-gated)
- ❤️ **Health check** — `/health` reports API + database status
- 📱 **Mobile-first UI** — banking-style navy/gold theme, FAB bottom nav, skeletons, toasts

**v2**
- 🎯 **Budgets** — set a monthly cap per category; dashboard card shows overall % ring,
  over-limit alerts, and per-category progress bars with health colors
- 📆 **Daily-spend bar** — today's spend vs a daily allowance derived from your monthly
  budgets (`total ÷ days in month`); falls back to a plain "spent today" when no budgets exist
- ⚡ **Quick add** — a merged card with a `Quick | ✨ Say it` toggle. Quick mode = category
  chips + amount + account dropdown + Add (~2 taps, defaults to Food / UPI)
- 🤖 **AI natural-language entry** — type "spent 250 on lunch at Swiggy" and it's parsed into
  a structured, editable expense (via Groq). Reviewed before saving; the API key stays
  server-side only
- 🔎 **Search** — filter the expenses list by category, merchant, or notes
- 📧 **Daily email digest** — opt-in (default off, toggled from Settings) summary of today's
  spend and budget status, sent via Resend on a daily [GitHub Actions](.github/workflows/daily-digest.yml)
  cron
- ⚙️ **Settings** — per-user preferences (currently: the email digest toggle)

---

## Tech stack

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) (Python) — layered architecture
- [SQLAlchemy 2.0](https://www.sqlalchemy.org/) ORM + [Alembic](https://alembic.sqlalchemy.org/) migrations
- [PostgreSQL](https://neon.tech/) (Neon serverless) via `psycopg2`
- JWT auth (`python-jose`) + password hashing (`passlib`/`bcrypt`)
- Pydantic v2 / `pydantic-settings` for config
- [Groq](https://groq.com/) (OpenAI-compatible) for natural-language parsing, and
  [Resend](https://resend.com/) for the email digest — both called from the backend via
  the standard library (no extra HTTP dependency)
- [Sentry](https://sentry.io/) for error monitoring
- [pytest](https://docs.pytest.org/) for the test suite

**Frontend**
- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) build tooling
- [Tailwind CSS](https://tailwindcss.com/) + inline styles for the banking theme
- `react-router-dom` routing, `react-hot-toast` notifications
- [Sentry](https://sentry.io/) (`@sentry/react`) for error monitoring
- Deployed on [Vercel](https://vercel.com/) (frontend) + [Render](https://render.com/) (backend)

**Scheduling**
- [GitHub Actions](https://docs.github.com/actions) cron — triggers the daily digest
  (Render's own cron requires a paid plan, so this stays on the free tier)

---

## Project structure

```
ledger_ai/
├── .github/workflows/         # daily-digest.yml (cron)
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── endpoints/     # auth, expense, income, dashboard, budget, ai, notifications, admin, health
│   │   │   └── router.py      # mounts all routers
│   │   ├── core/              # config, security (JWT/hashing), exceptions
│   │   ├── db/                # engine + session
│   │   ├── models/            # SQLAlchemy models (User, Expense, Income, Budget)
│   │   ├── schemas/           # Pydantic request/response models
│   │   ├── services/          # business logic (dashboard, budget, notification digest, email)
│   │   └── main.py            # FastAPI app, CORS, logging, Sentry init, exception handler
│   ├── alembic/               # migrations
│   ├── tests/                 # pytest suite (see Testing)
│   ├── pytest.ini
│   └── requirements.txt
└── frontend/
    └── src/
        ├── pages/             # Login, Register, Dashboard, Expense(s), Income, ManageBudgets, Settings, Admin
        ├── components/        # AppLayout, BottomNav, QuickAdd, BudgetCard, ProtectedRoute, Toast, Skeleton
        ├── context/           # AuthContext
        └── lib/               # api client, types, category config
```

The backend follows a **layered architecture**: `endpoints → services → models`, with
`schemas` for I/O validation and `core` for cross-cutting concerns.

---

## API reference

All routes are mounted at the root (no `/api` prefix). Auth routes are public; everything
else requires an `Authorization: Bearer <token>` header.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/register` | – | Create a new user |
| `POST` | `/login` | – | Get a JWT access token |
| `GET`  | `/me` | ✅ | Current user (`id`, `email`, `is_admin`, `email_notifications`) |
| `PATCH` | `/me` | ✅ | Update settings (currently: `email_notifications`) |
| `GET`  | `/dashboard` | ✅ | Balance, totals, monthly figures, per-account balances, today's spend + daily allowance, recent transactions |
| `GET/POST` | `/expenses` | ✅ | List / create expenses |
| `GET/PUT/DELETE` | `/expenses/{id}` | ✅ | Read / update / delete an expense |
| `GET/POST` | `/income` | ✅ | List / create income |
| `GET/PUT/DELETE` | `/income/{id}` | ✅ | Read / update / delete an income entry |
| `GET`  | `/budgets` | ✅ | Per-category spent-vs-cap + totals for the current month |
| `PUT`  | `/budgets` | ✅ | Set/upsert a category's monthly cap (amount ≤ 0 clears it) |
| `DELETE` | `/budgets/{category}` | ✅ | Remove a category's budget |
| `POST` | `/ai/parse-expense` | ✅ | Parse a natural-language note into `{amount, category, account, merchant, date}` via Groq (503 if `GROQ_API_KEY` is unset) |
| `POST` | `/notifications/send-daily-digest` | 🔑 cron secret | Emails the daily digest to every opted-in user. Server-to-server only — requires an `X-Cron-Secret` header matching `NOTIFICATION_CRON_SECRET`, not a user token |
| `GET`  | `/admin/stats` | 🛡️ admin | Totals + recent users |
| `GET`  | `/admin/users` | 🛡️ admin | Per-user counts & spend |
| `GET`  | `/health` | – | API + DB health |
| `GET`  | `/` | – | Service info |

Interactive API docs are available at `http://localhost:8000/docs` when the backend is running.

### Data model

- **Expense categories:** Food, Grocery, Fuel, Shopping, Bills, Health, Entertainment, Travel, Education, Other
- **Income categories:** Salary, Investment, Other
- **Account types:** Cash, UPI, Bank
- **Budgets:** one monthly cap per (user, category)

Users only ever see and modify their own data (every query is scoped by `user_id`).
Admin access is granted by email via the `ADMIN_EMAILS` env var. The AI parser's category
output is constrained to the expense-category list above.

---

## Getting started

### Prerequisites
- Python 3.13+
- Node.js 18+
- A PostgreSQL database (e.g. a free [Neon](https://neon.tech/) project)
- *(Optional, for AI entry)* a free [Groq](https://console.groq.com/) API key

### 1. Backend

```bash
cd backend
python -m venv vk_venv
# Windows
vk_venv/Scripts/activate
# macOS/Linux
# source vk_venv/bin/activate

pip install -r requirements.txt
```

Create `backend/.env`:

```env
ENVIRONMENT=development
DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require
JWT_SECRET=<a-long-random-secret>
ADMIN_EMAILS=you@example.com          # comma-separated for multiple admins
CORS_ORIGINS=http://localhost:5173    # comma-separated for multiple origins
GROQ_API_KEY=gsk_...                  # optional — enables AI natural-language entry
GROQ_MODEL=llama-3.3-70b-versatile    # optional — override the default model
RESEND_API_KEY=re_...                 # optional — enables the daily email digest
RESEND_FROM_EMAIL=Ledger AI <onboarding@resend.dev>   # optional
NOTIFICATION_CRON_SECRET=<a-long-random-secret>       # required to call /notifications/send-daily-digest
SENTRY_DSN=https://...@sentry.io/...  # optional — enables backend error monitoring
```

Run migrations and start the server:

```bash
alembic upgrade head
python -m uvicorn app.main:app --reload --port 8000
```

API is now at `http://localhost:8000` (docs at `/docs`).

> Without `GROQ_API_KEY`, everything works except the AI "Say it" mode, which returns a
> friendly "not configured" message. Quick add and the manual forms are unaffected.

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Start the dev server:

```bash
npm run dev
```

App is now at `http://localhost:5173`.

---

## Database migrations

Migrations are managed with Alembic (`backend/alembic/`).

```bash
alembic upgrade head                        # apply all migrations
alembic revision --autogenerate -m "msg"    # create a new migration
alembic downgrade -1                         # roll back one
```

---

## Configuration reference

| Var | Location | Required | Description |
|-----|----------|----------|-------------|
| `ENVIRONMENT` | backend | – | `development` / `production` label |
| `DATABASE_URL` | backend | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | backend | ✅ | Secret used to sign JWTs |
| `ADMIN_EMAILS` | backend | – | Comma-separated admin emails |
| `CORS_ORIGINS` | backend | – | Comma-separated allowed origins |
| `GROQ_API_KEY` | backend | – | Enables AI parsing; **never expose to the frontend** |
| `GROQ_MODEL` | backend | – | Groq model id (default `llama-3.3-70b-versatile`) |
| `RESEND_API_KEY` | backend | – | Enables the daily email digest |
| `RESEND_FROM_EMAIL` | backend | – | Sender address (default is Resend's test sender, no domain verification needed) |
| `NOTIFICATION_CRON_SECRET` | backend | – | Shared secret the digest scheduler must send in `X-Cron-Secret` |
| `SENTRY_DSN` | backend | – | Enables backend error monitoring |
| `VITE_API_BASE_URL` | frontend | ✅ | Base URL of the backend API |
| `VITE_SENTRY_DSN` | frontend | – | Enables frontend error monitoring |

> `.env` files are gitignored and are **not** committed — set these values in each
> environment (locally, on Render for the backend, and on Vercel for the frontend) yourself.
> The Groq and Resend keys must live only on the backend; the frontend never talks to those
> services directly. `NOTIFICATION_CRON_SECRET` must match the `CRON_SECRET` GitHub Actions
> secret used by the daily-digest workflow.

---

## Monitoring

**Error tracking** — [Sentry](https://sentry.io/), on both sides:
- Backend: initialized in `app/main.py` when `SENTRY_DSN` is set; every 500 handled by the
  global exception handler (`app/core/exceptions.py`) is also reported to Sentry.
- Frontend: initialized in `src/main.tsx` when `VITE_SENTRY_DSN` is set, wrapped around the
  app with a `Sentry.ErrorBoundary` so a crash shows a friendly fallback instead of a blank page.

Both are safe no-ops when their DSN isn't configured — nothing to set up to run the app locally.
Create two (free) Sentry projects — one Python/FastAPI, one React — to get separate DSNs.

**Uptime** — `GET /health` reports API + DB status; point a free external checker
(e.g. [UptimeRobot](https://uptimerobot.com/)) at it if you want downtime alerts.

**Logs** — request logging middleware in `app/main.py` logs every request with status + duration;
visible in Render's log stream.

---

## Testing

Backend has a `pytest` suite in `backend/tests/` covering auth, expense/income CRUD and
per-user isolation, budget aggregation, dashboard aggregation, the admin email gate, and the
auth checks on the AI and notification endpoints.

```bash
cd backend
pytest            # run the suite
pytest -v         # verbose, one line per test
```

Tests run against the **real** database configured in `.env` (no separate test DB needed) but
never leave data behind: each test runs inside a transaction that's rolled back afterward —
even though the endpoints under test call `db.commit()`, via the standard SQLAlchemy
nested-SAVEPOINT-restart pattern in `tests/conftest.py`. Tests that would otherwise make real
external calls (Groq, Resend) monkeypatch the relevant setting to force the deterministic
"not configured" code path instead.

There is no frontend test suite yet.

---

## Roadmap

Planned for **v3**:

- 📈 **Analytics & charts** (category breakdown, trends)
- 🔎 **Filters & date ranges** on the expenses list (search itself is done — see Features)
- 🔁 **Recurring transactions** (rent, salary, subscriptions)
- 🧾 **Receipt scanning** (photo → expense) and monthly **AI spending insights**
- 🏦 **Real accounts** (named accounts, opening balances, transfers)
- 📤 **CSV / PDF export**, 🌙 **dark mode**, 📲 **installable PWA** (unlocks browser push notifications)
- 🧪 **Frontend test suite** (Vitest + React Testing Library)

---

## License

Personal project — no license specified yet.
