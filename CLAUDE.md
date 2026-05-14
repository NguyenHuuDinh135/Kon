# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

Turborepo monorepo with dual-language stack (TypeScript frontend + Python backend):

```
apps/web       → Next.js 16 (React 19, Tailwind 4, Turbopack dev)
apps/api       → FastAPI (JWT auth, slowapi rate limiting, uvicorn)
apps/worker    → ETL pipeline (Kaggle → PostgreSQL) + APScheduler (4h ML retraining cycle)
packages/ui    → 74 shadcn/Radix components, Recharts, Framer Motion (motion v12)
packages/ai-engine → scikit-learn ML models + LangGraph agent + local Ollama (qwen2.5:7B) with Gemini fallback
packages/db-core   → SQLAlchemy models + Alembic migrations + pgvector
packages/shared    → Pydantic schemas shared between API and frontend
packages/mcp-servers → 7 agent tools with guardrails
```

Two route groups in `apps/web`:
- `(admin)` — dashboard with sidebar, predictions, agent chat (requires auth)
- `(storefront)` — public product pages, login, checkout

## Commands

```bash
# Development
npm run dev                              # All apps via turbo (web :3000, api :8000)
npm run build                            # Production build
npm run lint && npm run typecheck         # Check all workspaces

# API standalone
PYTHONPATH=packages/db-core:packages/shared:packages/ai-engine:packages/mcp-servers \
  uvicorn apps.api.main:app --reload --port 8000

# Database
docker compose up db -d                  # PostgreSQL + pgvector only
cd packages/db-core && alembic upgrade head  # Run migrations

# ETL (loads 3 Kaggle datasets into PostgreSQL)
PYTHONPATH=packages/db-core:packages/shared:packages/ai-engine \
  python apps/worker/main.py

# Testing
pytest apps/api/tests/                   # API integration
pytest packages/ai-engine/tests/         # ML model tests
pytest apps/worker/tests/                # ETL tests
npx playwright test --project=chromium   # E2E (from apps/web)

# Formatting
npx prettier --write "apps/web/**/*.{ts,tsx}"
ruff format apps/api/ packages/
ruff check --fix apps/api/ packages/
```

## Data Model

Three Kaggle datasets form a 3-layer topology:

| Layer | Tables | Purpose |
|-------|--------|---------|
| Olist (ERP Core) | orders, order_items, payments, reviews, customers, products, sellers, geolocation, category_translation | Order flow, revenue forecasting |
| Online Retail | online_retail_transactions | RFM analysis, K-Means clustering (4,300 customers → 5 segments) |
| E-Commerce Churn | customer_churn | Supervised ML with real churn labels (Decision Tree, Logistic Regression) |

System tables: users, audit_logs, system_alerts, notifications, campaigns, ml_model_metrics, ml_recommendations.

`customer_churn` has a pgvector `Vector(768)` column for embedding-based semantic search using nomic-embed-text (local) or Gemini (cloud).

## AI Agent

LangGraph ReAct agent (`packages/ai-engine/ai_engine/agent.py`) with **local Ollama (qwen2.5:7B) as primary** for chat and embeddings. Requires `USE_LOCAL_LLM=true` + `OLLAMA_BASE_URL` to be set. Falls back to Gemini Flash (cloud) if Ollama is unavailable or `USE_LOCAL_LLM=false`.

For embeddings:
- **Local**: `nomic-embed-text` model via Ollama (768-dim vectors) — recommended for cost savings
- **Cloud**: Gemini text-embedding-004 (fallback if Ollama not available)

7 MCP tools in `packages/mcp-servers/mcp_servers/tools.py`:
- `query_database` — Read-only SQL (50 row limit)
- `get_customer_profile` — Full customer profile + churn risk
- `get_churn_risk_summary` — Aggregate churn statistics
- `get_product_recommendations` — Collaborative filtering from Olist
- `get_revenue_insights` — Monthly trends + top categories
- `suggest_campaign` — Segment-based campaign generation
- `search_similar_customers` — pgvector cosine similarity

Autonomous loop (`ai_engine/autonomous_loop.py`): Observe → Analyze → Plan → Act cycle. Runs after ML training, creates draft campaigns (human-in-the-loop approval) and notifications.

## ML Models

Trained every 4 hours via APScheduler in the worker. All in `packages/ai-engine/ai_engine/ml_models.py`.

| Model | Algorithm | Target |
|-------|-----------|--------|
| K-Means | KMeans(k=5) on RFM | 5 segments: VIP, Loyal, Regular, At Risk, Lost |
| Decision Tree | GridSearchCV | Engagement level prediction |
| Logistic Regression | LogisticRegression | Binary churn (0/1) |
| Revenue Forecast | Linear Regression | Next 3 months revenue |

Model evaluation includes SHAP values, ROC curves, learning curves, and version history persisted to `ml_model_metrics` table.

## Key Patterns

- **API client** (`apps/web/lib/api.ts`): SSR uses `INTERNAL_API_URL` (defaults to `http://api:8000`), client uses `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000`). Auth token stored in localStorage + cookie.
- **Python path resolution**: Both `apps/api/main.py` and `apps/worker/main.py` manually append package paths with `sys.path.append`. When running outside Docker, set `PYTHONPATH=packages/db-core:packages/shared:packages/ai-engine:packages/mcp-servers`.
- **UI components**: Import from `@workspace/ui/components/<name>`. Project-specific components in `apps/web/components/`.
- **Route protection**: Admin routes use `require_admin` dependency (from `apps/api/routers/auth.py`). Frontend checks token presence.
- **Rate limiting**: slowapi on all API endpoints, keyed by remote address.

## Environment Variables

Required in `.env` at project root:
- `DATABASE_URL` — PostgreSQL connection (e.g., `postgresql://user:pass@localhost:5432/kon_erp_northwind`)
- `JWT_SECRET_KEY` — 32+ characters
- `KAGGLE_USERNAME` / `KAGGLE_KEY` — For ETL dataset downloads

Local LLM & Embeddings (recommended):
- `USE_LOCAL_LLM=true` — Enable local Ollama for agent chat
- `LOCAL_LLM_MODEL=qwen2.5` — Ollama model name (e.g., `qwen2.5`, `llama3.1`)
- `OLLAMA_BASE_URL=http://host.docker.internal:11434` — Ollama server endpoint
- `USE_OLLAMA=true` — Enable local embeddings via `nomic-embed-text`

Cloud LLM (fallback):
- `GOOGLE_API_KEY` — Gemini API key (required only if local LLM unavailable)

Optional:
- `CORS_ORIGINS` — Comma-separated (defaults to `http://localhost:3000`)

## Deployment

AWS via GitHub Actions (`deploy.yml`): builds Docker images → pushes to ECR → deploys. E2E tests run in separate workflow (`e2e.yml`).

Docker Compose runs three services (db, api, worker) on `kon_network`. The web app is built separately for deployment.

## Code Style

- TypeScript: Prettier + ESLint (workspace configs)
- Python: Ruff format + Ruff check
- Commits: conventional commits (`feat:`, `fix:`, `refactor:`, etc.)
