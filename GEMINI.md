# Kon: AI-Powered ERP & CRM Monorepo

## Project Overview
Kon is an autonomous agentic system that combines Enterprise Resource Planning (ERP) and Customer Relationship Management (CRM) functionalities. It leverages real-world e-commerce datasets (Olist, Online Retail, E-Commerce Churn) to perform risk analysis, plan marketing campaigns, and execute business decisions with human-in-the-loop approval.

### Architecture
- **Monorepo Structure**: Managed by Turborepo, utilizing `npm` workspaces.
- **Frontend (`apps/web`)**: Next.js (React 19) application for the business dashboard.
- **Backend API (`apps/api`)**: FastAPI application providing REST endpoints for CRM/ERP data and AI agent interactions.
- **Worker (`apps/worker`)**: Python-based ETL pipeline that loads datasets from Kaggle into PostgreSQL and generates embeddings.
- **Shared Packages (`packages/`)**:
  - `db-core`: SQLAlchemy models, migrations (Alembic), and database utilities.
  - `ai-engine`: ML training pipelines, recommendation logic, and agentic workflows.
  - `shared`: Pydantic models and shared utilities.
  - `ui`: Shared UI component library.

### Core Technologies
- **Database**: PostgreSQL with `pgvector` for semantic search.
- **AI/ML**:
  - Google Gemini (`text-embedding-004`) for high-quality text embeddings.
  - Local Ollama (`nomic-embed-text`) as a cost-effective alternative (toggle via `USE_OLLAMA=true`).
  - Scikit-learn for clustering (K-Means), classification (Decision Tree, Logistic Regression), and forecasting.
- **Orchestration**: Turborepo for workspace tasks, Docker Compose for infrastructure.

---

## Building and Running

### Prerequisites
- Node.js >= 20
- Python 3.11
- Docker & Docker Compose
- Kaggle API Credentials (set in `.env`)
- (Optional) Google API Key or local Ollama instance for embeddings.

### Key Commands

#### Setup
```bash
# Install dependencies for all workspaces
npm install
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your KAGGLE_USERNAME, KAGGLE_KEY, and GOOGLE_API_KEY
```

#### Infrastructure & Data
```bash
# Start database (pgvector)
docker-compose up -d db

# Run database migrations
cd packages/db-core && alembic upgrade head

# Validate Kaggle datasets (Check connectivity/availability)
python apps/worker/validate_datasets.py

# Run ETL and initial ML training
python apps/worker/main.py
```

#### Development
```bash
# Run all applications in development mode (Turbo)
npm run dev

# Run specific apps via Docker
docker-compose up -d api worker
```

#### Quality Control
```bash
npm run lint       # Lint all packages
npm run typecheck  # Run TypeScript type checks
npm run test       # Run tests (if available)
```

---

## Development Conventions

### Coding Style
- **Python**: Follows PEP 8. Uses FastAPI for APIs and SQLAlchemy for ORM. Path management often involves manual `sys.path.append` to resolve workspace packages.
- **TypeScript/React**: Modern React 19 patterns. Tailwind CSS for styling. Strictly typed with TypeScript.

### Data Patterns
- **3-Layer Topology**:
  1. **Core**: Olist Brazilian E-Commerce (Operational data).
  2. **Satellite 1**: Online Retail (RFM/Transaction data).
  3. **Satellite 2**: E-Commerce Churn (Behavioral/Label data).
- **Embeddings**: Standardized on **768 dimensions** to support both Gemini and local Ollama (`nomic-embed-text`) without schema changes.

### Machine Learning
- ML models are trained on-demand via the worker or API population scripts.
- Metrics and recommendations are persisted in the database for frontend consumption.
- Explainability (SHAP) is integrated into model training pipelines when available.

### Infrastructure
- **Docker**: Used for consistent development and deployment environments.
- **Environment Variables**: Managed via `.env` files. Crucial variables include `DATABASE_URL`, `KAGGLE_USERNAME`, `KAGGLE_KEY`, and `USE_OLLAMA`.
