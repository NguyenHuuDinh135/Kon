# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

Turborepo monorepo with dual-language stack (TypeScript frontend + Python backend):

```
apps/web       → Next.js 16 (React 19, Tailwind 4, Turbopack dev)
apps/api       → FastAPI (JWT auth, slowapi rate limiting, uvicorn)
apps/worker    → ETL pipeline (Kaggle → PostgreSQL) + APScheduler (4h ML retraining cycle)
packages/ui    → 74 shadcn/Radix components, Recharts, Framer Motion (motion v12)
packages/ai-engine → scikit-learn ML models + LangGraph agent + AWS Bedrock (Claude Haiku) with Ollama fallback
packages/db-core   → SQLAlchemy models + Alembic migrations + pgvector
packages/shared    → Pydantic schemas shared between API and frontend
packages/mcp-servers → 7 agent tools with guardrails
```

Two route groups in `apps/web`:
- `(admin)` — dashboard with sidebar, predictions, agent chat (requires auth)
- `(storefront)` — public product pages, login, checkout

## Commands

```bash
# Development (Docker Compose — recommended)
docker compose up -d                     # Start all 4 services
docker compose logs -f api               # Tail API logs
docker compose down                      # Stop all

# Development (standalone, requires PYTHONPATH)
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
cd apps/web && npx playwright test       # E2E (requires Docker stack running)

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

`customer_churn` has a pgvector `Vector(1024)` column for embedding-based semantic search using Bedrock Titan Embed v2 (primary) or Ollama mxbai-embed-large (fallback).

## AI Agent

LangGraph ReAct agent (`packages/ai-engine/ai_engine/agent.py`) with **AWS Bedrock Claude Haiku 3.5 as primary** LLM. Falls back to local Ollama (qwen2.5:7B) if Bedrock is unavailable.

For embeddings:
- **Primary**: AWS Bedrock Titan Embed v2 (1024-dim vectors)
- **Fallback**: Ollama `mxbai-embed-large` (1024-dim, local)

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
- **Route protection**: Admin routes use `require_admin` dependency (from `apps/api/routers/auth.py`). Frontend middleware checks `kon_token` cookie → redirects to `/login`.
- **Rate limiting**: slowapi on all API endpoints, keyed by remote address.

## Environment Variables

Required in `.env` at project root:
- `DATABASE_URL` — PostgreSQL connection (e.g., `postgresql://user:pass@localhost:5432/kon_erp_northwind`)
- `JWT_SECRET_KEY` — 32+ characters
- `KAGGLE_USERNAME` / `KAGGLE_KEY` — For ETL dataset downloads

LLM & Embeddings (Bedrock primary):
- `USE_BEDROCK=true` — Enable AWS Bedrock as primary LLM/embedding provider
- `AWS_REGION=us-west-2` — AWS region for Bedrock
- `BEDROCK_MODEL_ID=us.anthropic.claude-haiku-4-5-20251001-v1:0` — LLM model
- `BEDROCK_EMBEDDING_MODEL=amazon.titan-embed-text-v2:0` — Embedding model (1024-dim)
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` — AWS credentials (for Docker containers)

Ollama fallback (when Bedrock unavailable):
- `OLLAMA_BASE_URL=http://host.docker.internal:11434` — Ollama server endpoint
- `OLLAMA_LLM_MODEL=qwen2.5` — Chat model fallback
- `OLLAMA_EMBEDDING_MODEL=mxbai-embed-large` — Embedding model fallback (1024-dim)

Optional:
- `CORS_ORIGINS` — Comma-separated (defaults to `http://localhost:3000`)

## Deployment

Docker Compose (local only). No cloud deployment — runs entirely on the developer machine.

Four services on `kon_network`:
- `db` — PostgreSQL + pgvector (port 5432, `restart: always`)
- `worker` — ETL + ML retraining (`restart: on-failure`, 2G memory limit)
- `api` — FastAPI (port 8000, `restart: unless-stopped`)
- `web` — Next.js standalone (port 3000, `restart: unless-stopped`, uses `INTERNAL_API_URL=http://api:8000` for SSR)

Ollama runs on the host machine (port 11434), accessible from containers via `host.docker.internal`.

CI runs via GitHub Actions (`e2e.yml`): lint → typecheck → Python tests → Playwright E2E.

## Code Style

- TypeScript: Prettier + ESLint (workspace configs)
- Python: Ruff format + Ruff check
- Commits: conventional commits (`feat:`, `fix:`, `refactor:`, etc.)
