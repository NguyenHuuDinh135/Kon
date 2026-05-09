# Kon: Autonomous AI ERP & CRM System

**Kon** is an autonomous agentic system combining enterprise resource planning (ERP) and customer relationship management (CRM). Using real-world e-commerce datasets (Olist, Online Retail, E-Commerce Churn), Kon observes, analyzes risk, plans marketing campaigns, and executes business decisions autonomously with human-in-the-loop approval.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Turborepo Monorepo                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  apps/web    │  │  apps/api    │  │    apps/worker       │  │
│  │  Next.js 16  │  │  FastAPI     │  │  ETL + APScheduler   │  │
│  │  React 19    │  │  JWT + Rate  │  │  Kaggle -> PostgreSQL│  │
│  │  Tailwind 4  │  │  Limiting    │  │  ML Training (4h)    │  │
│  │  Recharts    │  │  30+ routes  │  │                      │  │
│  │  Framer      │  │              │  │                      │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                  │                      │              │
│         └──────────────────┼──────────────────────┘              │
│                            │                                     │
│  ┌─────────────────────────┼─────────────────────────────────┐  │
│  │                    Packages Layer                           │  │
│  │                                                            │  │
│  │  ┌─────────────┐ ┌──────────┐ ┌────────┐ ┌────────────┐  │  │
│  │  │ ai-engine   │ │ db-core  │ │ shared │ │mcp-servers │  │  │
│  │  │ scikit-learn│ │ SQLAlch. │ │Pydantic│ │ Guardrails │  │  │
│  │  │ LangGraph   │ │ Alembic  │ │Types   │ │ Tools      │  │  │
│  │  │ Gemini      │ │ pgvector │ │        │ │            │  │  │
│  │  └─────────────┘ └──────────┘ └────────┘ └────────────┘  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                            │                                     │
│  ┌─────────────────────────┼─────────────────────────────────┐  │
│  │         PostgreSQL + pgvector (Docker)                      │  │
│  │  Olist (9 tables) │ Online Retail │ Churn │ ML Results     │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Datasets (3-Layer Topology)

| Layer | Dataset | Source (Kaggle) | Scale |
|-------|---------|-----------------|-------|
| **ERP Core** | Olist Brazilian E-Commerce | `olistbr/brazilian-ecommerce` | 100K+ orders, 9 relational tables |
| **Satellite 1** | Online Retail (UCI) | `tunguz/online-retail` | 541K transactions, 4,300 unique customers |
| **Satellite 2** | E-Commerce Churn | `ankitverma2010/ecommerce-customer-churn-analysis-and-prediction` | 5,630 labeled customers (real churn labels) |

### Why 3 Datasets?

- **Olist** provides real Brazilian e-commerce order flow (products, payments, reviews, geolocation) for ERP core operations and revenue forecasting.
- **Online Retail** provides transaction-level data ideal for RFM analysis and K-Means customer segmentation.
- **E-Commerce Churn** provides real binary churn labels + engagement features for supervised ML (Decision Tree, Logistic Regression).

---

## ML Models

| Model | Algorithm | Data Source | Target | Key Metrics |
|-------|-----------|-------------|--------|-------------|
| **K-Means Clustering** | KMeans (k=5) | Online Retail RFM | 5 segments (VIP, Loyal, Regular, At Risk, Lost) | Silhouette score, inertia |
| **Decision Tree** | DecisionTreeClassifier + GridSearchCV | E-Commerce Churn | Engagement level | Accuracy, F1, feature importance |
| **Logistic Regression** | LogisticRegression | E-Commerce Churn | Churn (0/1 real labels) | AUC-ROC, precision, recall |
| **Revenue Forecast** | Linear Regression | Olist monthly revenue | Next 3 months | MAE, RMSE, R2 |

### ML Features

- **GridSearchCV** hyperparameter tuning for Decision Tree
- **SHAP values** for model explainability
- **ROC curves** and learning curves for evaluation
- **Model versioning** with history tracking
- **Automatic retraining** every 4 hours via APScheduler

### AI Agent & Autonomous Intelligence

| Component | Technology | Description |
|-----------|-----------|-------------|
| Chat Agent | LangGraph + Gemini 2.0 Flash | Answers business questions with 7 data tools |
| Autonomous Loop | Custom Python | Observe→Analyze→Plan→Act cycle every 4 hours |
| Vector Search | pgvector + Gemini embeddings | Semantic customer search in natural language |
| Recommendations | Collaborative Filtering | Products from Olist co-purchase patterns |
| Campaign AI | Rule-based + LLM | Auto-suggests retention campaigns for at-risk segments |

**Autonomous Cycle Output:**
- Creates draft campaigns for admin approval (Human-in-the-Loop)
- Generates notifications for business events
- Logs insights for audit trail
- Monitors revenue trends, churn shifts, satisfaction drops

---

## Features

### Dashboard & Analytics
- Real-time KPIs (revenue, orders, customers, growth)
- Revenue over time with trend analysis
- Customer segmentation visualization
- Top products ranking
- MDX-style multidimensional analytics
- Customer Lifetime Value (CLV) computation
- RFM scoring
- Revenue forecasting

### Notifications & Campaigns
- AI-generated notifications for business events
- Unread count badges with real-time updates
- Campaign creation with AI-suggested targeting
- Human-in-the-loop campaign approval workflow
- Campaign execution tracking

### ML Predictions Dashboard
- Decision Tree predictions with feature importance charts
- K-Means clustering with interactive scatter plots
- Logistic Regression churn probabilities with risk levels
- Model comparison view (side-by-side all models)
- SHAP value explanations
- ROC curve visualization
- Model training history and learning curves

### Security
- JWT authentication with token refresh
- Rate limiting (slowapi) on all endpoints
- Security headers (HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
- Account lockout after repeated failed logins
- Input validation with Pydantic schemas
- CORS whitelist configuration

### Frontend (Awwwards-quality)
- Dark luxury theme with intentional depth and layering
- Framer Motion animations throughout
- Recharts data visualizations
- Responsive design (320px to 4K)
- shadcn/ui + Radix primitives
- Skeleton loading states

---

## API Endpoints (30+)

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/login | User login (returns JWT) |
| POST | /auth/register | User registration |
| GET | /auth/me | Current user profile |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /dashboard/kpis | Key performance indicators |
| GET | /dashboard/revenue-over-time | Revenue time series |
| GET | /dashboard/segmentation-stats | Customer segment breakdown |
| GET | /dashboard/top-products | Best-selling products |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /analytics/mdx/revenue-by-segment | Revenue by customer cluster |
| GET | /analytics/mdx/churn-by-demographics | Churn rate by age x gender |
| GET | /analytics/mdx/spending-distribution | Spending stats by category |
| GET | /analytics/clv | Customer lifetime value |
| GET | /analytics/rfm-scores | RFM analysis results |
| GET | /analytics/forecast | Revenue forecast |

### ML Predictions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /predictions/decision-tree | Engagement predictions |
| GET | /predictions/clustering | K-Means cluster assignments |
| GET | /predictions/logistic-regression | Churn probabilities |
| GET | /predictions/compare | All models side-by-side |
| GET | /models/metrics | Model accuracy metrics |
| GET | /models/evaluation-report | Detailed evaluation |
| GET | /models/shap-values | SHAP explanations |
| GET | /models/roc-curve | ROC curve data |
| GET | /models/history | Training history |
| GET | /models/learning-curves | Learning curve data |
| POST | /models/retrain | Trigger retraining |

### Notifications & Campaigns
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /notifications | List notifications |
| GET | /notifications/unread-count | Unread badge count |
| PUT | /notifications/{id}/read | Mark as read |
| PUT | /notifications/read-all | Mark all as read |
| GET | /campaigns | List campaigns |
| POST | /campaigns | Create campaign |
| PUT | /campaigns/{id}/approve | Approve campaign |
| PUT | /campaigns/{id}/execute | Execute campaign |

### CRUD & System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /products | List products |
| GET | /customers | List customers |
| GET | /orders | List orders |
| POST | /orders | Create order |
| GET | /analytics/ai-insights | Autonomous cycle results |
| GET | /health | Basic health check |
| GET | /health/detailed | Detailed system health |

---

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- Kaggle account (for dataset ETL)

### Setup

1. **Clone and install**:
   ```bash
   git clone https://github.com/NguyenHuuDinh135/Kon.git
   cd Kon
   npm install
   pip install -r requirements.txt
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials:
   # - GOOGLE_API_KEY (Gemini)
   # - KAGGLE_USERNAME + KAGGLE_KEY
   # - JWT_SECRET_KEY (32+ chars)
   ```

3. **Start database**:
   ```bash
   docker compose up db -d
   ```

4. **Run migrations**:
   ```bash
   cd packages/db-core && alembic upgrade head
   ```

5. **Run ETL** (loads all 3 datasets from Kaggle):
   ```bash
   python apps/worker/main.py
   ```

6. **Start development**:
   ```bash
   npm run dev
   ```

   This starts:
   - Web: http://localhost:3000
   - API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

---

## Testing

```bash
# ML model unit tests
pytest packages/ai-engine/tests/

# API integration tests
pytest apps/api/tests/

# E2E tests (Playwright)
npx playwright test --project=chromium

# TypeScript type checking
npm run typecheck

# Linting
npm run lint
ruff check apps/ packages/
```

---

## DevOps

- **Docker**: Multi-stage builds for API and Worker
- **Migrations**: Alembic (packages/db-core)
- **CI/CD**: Lint, typecheck, test, build pipeline
- **Backup**: `./scripts/backup.sh` for database snapshots
- **Scheduling**: APScheduler for ML retraining every 4 hours

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `DB_USER` | Yes | PostgreSQL username |
| `DB_PASSWORD` | Yes | PostgreSQL password |
| `DB_NAME` | Yes | Database name |
| `GOOGLE_API_KEY` | Yes | Gemini API key for AI Engine |
| `KAGGLE_USERNAME` | Yes | Kaggle account for dataset ETL |
| `KAGGLE_KEY` | Yes | Kaggle API key |
| `JWT_SECRET_KEY` | Yes | Secret for JWT signing (32+ chars) |
| `CORS_ORIGINS` | No | Allowed origins (default: http://localhost:3000) |

---

## Project Structure

```
Kon/
├── apps/
│   ├── web/           # Next.js 16 frontend (React 19, Tailwind 4)
│   ├── api/           # FastAPI backend (routers, middleware, auth)
│   └── worker/        # ETL pipeline + APScheduler
├── packages/
│   ├── ai-engine/     # ML models (sklearn) + LangGraph + Gemini
│   ├── db-core/       # SQLAlchemy models + Alembic migrations
│   ├── shared/        # Pydantic models + shared types
│   ├── mcp-servers/   # Agent tools with guardrails
│   ├── ui/            # Shared UI components
│   ├── eslint-config/ # ESLint configuration
│   └── typescript-config/ # TypeScript configuration
├── scripts/           # Utility scripts (backup, etc.)
├── notebooks/         # Jupyter notebooks for analysis
├── docker-compose.yml
├── turbo.json
└── package.json
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, Radix, Recharts, Framer Motion |
| Backend | FastAPI, SQLAlchemy, Alembic, slowapi, Pydantic |
| AI/ML | scikit-learn, LangGraph, Google Gemini, SHAP |
| Database | PostgreSQL, pgvector |
| DevOps | Docker, Turborepo, APScheduler |
| Testing | Playwright, pytest, Vitest |
