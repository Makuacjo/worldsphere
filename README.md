# WORLDSPHERE

An immersive digital atlas of Earth's biodiversity — an editorial, exploration-first
web app backed by real biodiversity data, a conservation-risk model, streaming AI,
and real user accounts.

- **Frontend** — React + TypeScript + Vite, cool-editorial design system, floating
  glass navigation, a Three.js interactive globe, WebGL hero, and premium motion.
- **Backend (`ml-service/`)** — FastAPI + scikit-learn: a conservation-risk model,
  dataset insights, a streaming AI naturalist (via OpenRouter), and accounts +
  favorites (PostgreSQL).
- **Live data** — species search over **GBIF** (hundreds of millions of records).

---

## Features

| Surface | What it does |
|---|---|
| **Home** | Immersive scroll: WebGL hero → featured stories → interactive globe → regions → AI → research → communities/expeditions. |
| **Explore** (`/explore`) | Real **GBIF** species search — photos, IUCN status, taxonomy, occurrence maps, distributions. |
| **Maps** (`/maps`) | **Three.js** Earth — shader continents, atmosphere, stars, drag/zoom; region markers → filtered stories. |
| **Stories** (`/stories`) | Editorial cards for the curated catalog, category filters, card→detail View-Transition morph. |
| **AI Explorer** (`/ai`) | A field-naturalist chatbot streaming from **OpenRouter**, plus the conservation-risk predictor. |
| **Research** (`/research`) | Live analytics from the model — distributions, feature importance, risk buckets, count-up stats. |
| **Communities / Expeditions** | On-brand design-preview shells. |
| **Accounts** | Real signup/login, hashed passwords, per-user **favorites** (heart any species). |

---

## Tech stack

- **Frontend:** React 19, TypeScript, Vite, React Router (data router), Framer Motion,
  Three.js, OGL, Recharts, React-Bootstrap, Lucide icons, `react-markdown`.
- **Backend:** Python, FastAPI, scikit-learn, pandas, PostgreSQL (`psycopg`), uvicorn.
- **External:** GBIF API (keyless), OpenRouter (AI).

---

## Repository layout

```
.
├── src/                    # React app
│   ├── components/         # nav, hero, globe, cards, cursor, favorites…
│   ├── context/            # Auth (accounts + favorites) + Theme
│   ├── pages/              # Home, Explore, Maps, Stories, AI, Research, …
│   ├── services/           # gbif, ai, auth, conservationApi clients
│   └── index.css           # design tokens + all styles
├── ml-service/             # FastAPI backend
│   ├── app/                # main, service, ai, auth, db, schemas
│   ├── model/train.py      # trains the RandomForest → artifacts/
│   └── common.py           # dataset + feature definitions
└── .env                    # frontend: VITE_ML_API_URL
```

---

## Quick start

### 1. Frontend

```bash
npm install
npm run dev            # http://localhost:5173
```

Copy `.env.example` to an untracked `.env` and point the app at the backend:

```
VITE_ML_API_URL=http://localhost:8000
```

The frontend runs standalone — Explore (GBIF) works with no backend. Research,
AI Explorer, and accounts need `ml-service` running (they degrade gracefully with
clear "start the ml-service" states otherwise).

### 2. Backend (`ml-service/`)

```bash
cd ml-service
python -m venv .venv
# Windows:  .venv\Scripts\Activate.ps1
# Unix:     source .venv/bin/activate
pip install -r requirements.txt

python model/train.py                       # trains the model → artifacts/
uvicorn app.main:app --reload --port 8000
```

Create `ml-service/.env` from `ml-service/.env.example` (gitignored). PostgreSQL
and a stable auth secret are required; OpenRouter is optional:

```
DATABASE_URL=postgresql://user:password@localhost:5432/worldsphere
AUTH_SECRET=replace-with-at-least-32-random-characters
OPENROUTER_API_KEY=sk-or-v1-...
AI_MODEL=openrouter/free
```

It's loaded automatically at startup. Without it, `/ai/ask` returns 503 and the
AI page shows a "not configured" state.

---

## Environment variables

| Where | Var | Purpose |
|---|---|---|
| `.env` (frontend) | `VITE_ML_API_URL` | Backend base URL. Required in production; development defaults to `http://localhost:8000`. |
| `ml-service/.env` | `OPENROUTER_API_KEY` | Enables the streaming AI naturalist. **Keep secret** — gitignored. |
| `ml-service/.env` | `AI_MODEL` | OpenRouter model id (zero-cost default: `openrouter/free`). |
| `ml-service/.env` | `DATABASE_URL` | Neon or local PostgreSQL connection string. Server-only and required. |
| `ml-service/.env` | `AUTH_SECRET` | Stable token-signing secret of at least 32 bytes. Server-only and required. |
| `ml-service/.env` | `FRONTEND_URL` / `CORS_ORIGINS` | Exact production frontend origin and optional comma-separated additional origins. |

---

## Backend API

| Method | Path | Notes |
|---|---|---|
| GET | `/health` | `{ status, model_ready, ai_ready }` |
| POST | `/predict` | Conservation-risk prediction from species traits |
| GET | `/insights` | Dataset + model analytics (powers Research) |
| POST | `/ai/ask` | Streams a natural-language answer (OpenRouter) |
| POST | `/auth/signup` · `/auth/login` | Returns `{ token, user }` |
| GET | `/auth/me` | Current user (Bearer token) |
| GET/POST | `/favorites` · DELETE `/favorites/{source}/{key}` | Per-user saved species |

CORS permits local Vite/preview origins plus exact origins configured through
`FRONTEND_URL` and `CORS_ORIGINS`. Wildcards are rejected.

## Production deployment

Deploy the frontend `dist/` directory to Cloudflare Pages with build command
`npm run build`; set the browser-visible `VITE_ML_API_URL` to the Render HTTPS
service before building. `public/_redirects` preserves SPA routing.

The repository `render.yaml` provisions the Render web-service definition. It
installs Python dependencies and trains the model during the build, then starts
one Uvicorn process on `$PORT`. Configure `DATABASE_URL` with Neon's pooled
PostgreSQL URL, `FRONTEND_URL`, `APP_URL`, and any OpenRouter key in Render.
Never put these server-only values in Cloudflare's `VITE_` variables.

Authentication uses a compatible custom HMAC token and PBKDF2 password hashes.
Credential endpoints have per-instance IP rate limiting. This is suitable for a
small free deployment, but a multi-instance deployment should replace the
in-memory limiter with a shared store and add password reset, email verification,
session revocation, and security-event auditing.

---

## Notes

- **Data honesty:** the conservation dataset is a synthetic, IUCN-style starter set
  (`ml-service/common.py`) — swap in real Red List / occurrence data with the same
  columns and re-run `train.py`; no API/frontend changes needed. Communities and
  Expeditions are polished design shells, marked as previews.
- **Auth** is a self-hosted demo: stdlib pbkdf2 password hashing + HMAC-signed
  tokens (no PyJWT/bcrypt). Fine for local use; harden before production.
- **Accessibility:** skip link, `prefers-reduced-motion` honored throughout,
  keyboard-navigable, `color-scheme` set per theme.
- **Performance:** route-level code-splitting, lazy Three.js globe (mounts in view),
  lazy images, vendor chunking.

---

## Scripts (frontend)

```bash
npm run dev        # dev server
npm run build      # type-check + production build
npm run preview    # preview the build
npm run lint       # eslint
```

---

## Build

```bash
npm run build      # tsc -b && vite build  →  dist/
```

The client deploys as a static SPA (see `vercel.json` / `public/_redirects` for
history-fallback routing). Deploy `ml-service` separately and point
`VITE_ML_API_URL` at it.
