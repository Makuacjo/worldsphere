# WORLDSPHERE

An immersive digital atlas of Earth's biodiversity — an editorial, exploration-first
web app backed by real biodiversity data, a conservation-risk model, streaming AI,
and real user accounts.

- **Frontend** — React + TypeScript + Vite, cool-editorial design system, floating
  glass navigation, a Three.js interactive globe, WebGL hero, and premium motion.
- **Backend (`ml-service/`)** — FastAPI + scikit-learn: a conservation-risk model,
  dataset insights, a streaming AI naturalist (via OpenRouter), and accounts +
  favorites (SQLite).
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
- **Backend:** Python, FastAPI, scikit-learn, pandas, SQLite (stdlib), uvicorn.
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

`.env` (already present) points the app at the backend:

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

To enable the **AI Explorer**, create `ml-service/.env` (gitignored):

```
OPENROUTER_API_KEY=sk-or-v1-...
# AI_MODEL=openai/gpt-4o-mini      # optional; any OpenRouter model id
```

It's loaded automatically at startup. Without it, `/ai/ask` returns 503 and the
AI page shows a "not configured" state.

---

## Environment variables

| Where | Var | Purpose |
|---|---|---|
| `.env` (frontend) | `VITE_ML_API_URL` | Backend base URL (default `http://localhost:8000`). |
| `ml-service/.env` | `OPENROUTER_API_KEY` | Enables the streaming AI naturalist. **Keep secret** — gitignored. |
| `ml-service/.env` | `AI_MODEL` | OpenRouter model id (default `openai/gpt-4o-mini`). |
| shell (optional) | `AUTH_SECRET` | Token-signing secret. Auto-generated + persisted to `artifacts/` if unset. |

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

CORS is open to `http://localhost:5173`.

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
