# 🛡️ Kon: Autonomous AI ERP & CRM System

Kon is an autonomous Agentic System that combines Enterprise Resource Planning (ERP) and Customer Relationship Management (CRM). It uses **Northwind Traders** as its core data and extends it with behavioral datasets. Kon is capable of proactively observing, analyzing risks, planning marketing strategies, and executing business decisions automatically.

## 🏗️ Architecture (Turborepo Monorepo)

The project is organized as a monorepo using Turborepo to ensure consistency between the UI, AI logic, and data layers.

### 📱 Apps
- **`apps/web`**: Next.js 15 (App Router) executive dashboard. Displays ERP reports, customer heatmaps, and AI "Stream of Thoughts".
- **`apps/worker`**: Python-based background processes, specifically for **Direct ETL** loading data from Kaggle directly into PostgreSQL.
- **`apps/api`** (Planned/Referenced): FastAPI Gateway for authentication, session management, and AI coordination.

### 📦 Packages
- **`packages/ui`**: Shared UI component library built with React 19, Tailwind CSS 4, Radix UI, and Shadcn UI.
- **`packages/eslint-config`**: Shared ESLint configurations.
- **`packages/typescript-config`**: Shared TypeScript configurations.
- **`packages/ai-engine`** (Planned/Referenced): LangGraph-based AI logic using Gemini API.
- **`packages/db-core`** (Planned/Referenced): PostgreSQL management with SQLAlchemy and `pgvector`.
- **`packages/mcp-servers`** (Planned/Referenced): Model Context Protocol (MCP) servers for agent tools.

## 🚀 Getting Started

### Prerequisites
- Node.js >= 20
- Python 3.x
- Docker (for PostgreSQL)
- Kaggle API Key (for ETL)
- Google Gemini API Key

### Installation
```bash
npm install
```

### Environment Setup
Create a `.env` file in the root directory based on `.env.example`:
```bash
cp .env.example .env
```
Ensure you fill in `DATABASE_URL`, `GOOGLE_API_KEY`, `KAGGLE_USERNAME`, and `KAGGLE_KEY`.

### Database & ETL
1. Start the database:
   ```bash
   docker compose up db -d
   ```
2. Run the ETL process:
   ```bash
   python apps/worker/main.py
   ```

### Development
Start all applications in development mode:
```bash
npm run dev
```

## 🛠️ Development Commands

- `npm run build`: Build all workspace projects.
- `npm run dev`: Start all projects in development mode.
- `npm run lint`: Run linting across the monorepo.
- `npm run format`: Format code using Prettier.
- `npm run typecheck`: Run TypeScript type checking.

## 📜 Development Conventions

### Tech Stack
- **Frontend**: React 19, Next.js 15, Tailwind CSS 4, Lucide React.
- **UI Components**: Radix UI primitives, Shadcn UI patterns.
- **Styling**: Vanilla CSS with Tailwind CSS 4 utilities.
- **Backend/Worker**: Python, FastAPI, SQLAlchemy.
- **AI**: LangGraph, Gemini API (Flash/Pro).
- **Database**: PostgreSQL with `pgvector` for semantic search.

### Monorepo Management
- Use `npm` as the package manager.
- New shared components should be added to `packages/ui`.
- Use Turborepo for task orchestration.

### AI Integration
- Agents are designed with an **Observe-Analyze-Plan-Act** loop.
- Interactions with the database should go through MCP Servers to enforce security guardrails.
- Human-in-the-loop (HITL) is required for marketing executions and database updates.
