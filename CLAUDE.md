# Kon: Autonomous AI ERP & CRM System

## Architecture

Turborepo monorepo with dual-language stack:
- **Frontend**: `apps/web` — Next.js 16, React 19, Tailwind 4, shadcn/Radix, Recharts, Framer Motion
- **API**: `apps/api` — FastAPI (Python), JWT auth, slowapi rate limiting, uvicorn
- **Worker**: `apps/worker` — Python ETL pipeline (Kaggle → PostgreSQL) + APScheduler
- **AI Engine**: `packages/ai-engine` — scikit-learn ML models + LangGraph + Gemini agent
- **Database**: PostgreSQL + pgvector (Docker)
- **MCP Servers**: `packages/mcp-servers` — Agent tools with guardrails

## Datasets (3-Layer Topology)

| Layer | Dataset | Source | Rows |
|-------|---------|--------|------|
| ERP Core | Olist Brazilian E-Commerce | `olistbr/brazilian-ecommerce` | 100K+ orders, 9 tables |
| Satellite 1 | Online Retail (UCI) | `tunguz/online-retail` | 541K transactions |
| Satellite 2 | E-Commerce Churn | `ankitverma2010/ecommerce-customer-churn-analysis-and-prediction` | 5,630 labeled customers |

## Common Commands

```bash
# Development
npm run dev              # Start all apps (turbo)
npm run build            # Production build
npm run lint             # Lint all workspaces
npm run typecheck        # TypeScript type check

# Database
docker compose up db -d  # Start PostgreSQL + pgvector
docker compose up -d     # Start all services

# ETL (loads all 3 datasets)
python apps/worker/main.py

# API
uvicorn apps.api.main:app --reload --port 8000

# Testing
pytest packages/ai-engine/tests/       # ML unit tests
pytest apps/api/tests/                  # API integration tests
npx playwright test --project=chromium  # E2E tests

# Database Migrations
cd packages/db-core && alembic upgrade head

# Backup
./scripts/backup.sh
```

## ML Models

| Model | Data Source | Target | Features |
|-------|-----------|--------|----------|
| K-Means Clustering | Online Retail RFM (4,300 customers) | 5 segments | Recency, Frequency, Monetary |
| Decision Tree | E-Commerce Churn (5,630 rows) | Engagement level | Tenure, Satisfaction, Devices, etc. |
| Logistic Regression | E-Commerce Churn (5,630 rows) | Churn (0/1 REAL labels) | 13 numeric + 5 categorical features |
| Revenue Forecast | Olist monthly revenue | Next 3 months | Linear regression on time series |

Training runs every 4 hours via APScheduler. Includes: GridSearchCV, SHAP, ROC curves, learning curves, model versioning.

## API Endpoints (30+)

### Auth
- POST /auth/login, /auth/register, GET /auth/me

### Dashboard & Analytics
- GET /dashboard/kpis, /dashboard/revenue-over-time, /dashboard/segmentation-stats, /dashboard/top-products
- GET /analytics/mdx/revenue-by-segment, /analytics/mdx/churn-by-demographics, /analytics/mdx/spending-distribution
- GET /analytics/clv, /analytics/rfm-scores, /analytics/forecast

### ML Predictions
- GET /predictions/decision-tree, /predictions/clustering, /predictions/logistic-regression, /predictions/compare
- GET /models/metrics, /models/evaluation-report, /models/shap-values, /models/roc-curve, /models/history, /models/learning-curves
- POST /models/retrain

### Business
- GET/PUT /notifications, /notifications/unread-count, /notifications/{id}/read, /notifications/read-all
- GET/POST /campaigns, PUT /campaigns/{id}/approve, /campaigns/{id}/execute

### CRUD
- GET /products, /customers, /orders
- POST /orders

### System
- GET /health, /health/detailed

## Project Conventions

- API routers in `apps/api/routers/` (auth, analytics, predictions, notifications, campaigns)
- Python packages: `packages/ai-engine/`, `packages/db-core/`, `packages/shared/`, `packages/mcp-servers/`
- PYTHONPATH: `packages/db-core:packages/shared:packages/ai-engine:packages/mcp-servers`
- Env vars in `.env` (never commit)
- Docker network: `kon_network`
- Ports: API=8000, Web=3000, PostgreSQL=5432

## Security

- Rate limiting via slowapi on all endpoints
- Security headers (HSTS, X-Content-Type-Options, X-Frame-Options)
- Account lockout after failed login attempts
- Input validation with Pydantic schemas
- JWT tokens with expiry and refresh
- CORS whitelist configuration

## DevOps

- Multi-stage Docker builds (apps/api/Dockerfile, apps/worker/Dockerfile)
- Alembic migrations in packages/db-core
- CI/CD pipeline (lint, typecheck, test, build)
- Backup script: ./scripts/backup.sh
- APScheduler for periodic ML retraining

## Key Environment Variables

- `DATABASE_URL` — PostgreSQL connection string
- `GOOGLE_API_KEY` — Gemini API access
- `KAGGLE_USERNAME` / `KAGGLE_KEY` — Dataset ETL
- `JWT_SECRET_KEY` — Must be 32+ chars, required
- `CORS_ORIGINS` — Comma-separated allowed origins

## AI Agent (packages/ai-engine + packages/mcp-servers)

### LangGraph Agent
- Model: Gemini 2.0 Flash Lite (temperature 0.3)
- Pattern: ReAct with 7 specialized tools
- System prompt: Business intelligence assistant with data context

### MCP Tools (7 tools)
- `query_database` — Read-only SQL on all tables (50 row limit)
- `get_customer_profile` — Full customer profile with churn risk interpretation
- `get_churn_risk_summary` — Aggregate churn statistics across customer base
- `get_product_recommendations` — Collaborative filtering from Olist order history
- `get_revenue_insights` — Monthly trends + top categories
- `suggest_campaign` — Segment-based campaign suggestions with data
- `search_similar_customers` — pgvector semantic search (Gemini embeddings)

### Autonomous Loop (runs every 4h after ML training)
1. Observe: Revenue trends, churn risk, categories, review health
2. Analyze: Identify insights with urgency scoring
3. Plan: Generate campaigns + notifications
4. Act: Create draft campaigns (Human-in-the-Loop) + notifications
5. Log: Audit trail in system_alerts

### Vector Search
- Embeddings: Gemini text-embedding-004 (768 dimensions)
- Storage: pgvector on customer_churn table
- Search: Cosine similarity for natural language customer queries

## Code Style

- TypeScript: Prettier + ESLint (project configs)
- Python: Ruff format + Ruff check
- Commits: conventional commits (`feat:`, `fix:`, `refactor:`, etc.)
- Target: 80% test coverage minimum
