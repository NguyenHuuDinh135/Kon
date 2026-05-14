# Hướng dẫn chạy ứng dụng KON ERP/CRM

## Yêu cầu hệ thống

| Phần mềm | Phiên bản tối thiểu | Ghi chú |
|-----------|---------------------|---------|
| Docker Desktop | 4.x | Bật Docker Compose V2 |
| Git | 2.x | Clone source code |
| Node.js | 20+ | Chỉ cần nếu chạy frontend ngoài Docker |
| RAM | 8 GB+ | Worker cần 2GB cho ML training |

---

## Cách 1: Docker Compose (Khuyến nghị)

Chạy toàn bộ app bằng 1 lệnh duy nhất.

### Bước 1: Clone repository

```bash
git clone https://github.com/NguyenHuuDinh135/Kon.git
cd Kon
```

### Bước 2: Tạo file `.env`

```bash
cp .env.example .env
```

Mở file `.env` và điền các giá trị:

```env
# Database (giữ nguyên mặc định hoặc tùy chỉnh)
DB_USER=nguyenhuudinh
DB_PASSWORD=kon_password
DB_NAME=kon_erp_northwind
DATABASE_URL=postgresql://nguyenhuudinh:kon_password@localhost:5432/kon_erp_northwind

# Kaggle (bắt buộc để ETL load dữ liệu)
KAGGLE_USERNAME=<username từ kaggle.com/settings>
KAGGLE_KEY=<api key từ kaggle.com/settings>

# JWT Secret (bắt buộc)
JWT_SECRET_KEY=my-super-secret-key-at-least-32-chars

# CORS
CORS_ORIGINS=http://localhost:3000

# AI — Chọn 1 trong 2 cách:

# Cách A: AWS Bedrock (cần tài khoản AWS)
USE_BEDROCK=true
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=<your key>
AWS_SECRET_ACCESS_KEY=<your secret>
BEDROCK_MODEL_ID=us.anthropic.claude-haiku-4-5-20251001-v1:0
BEDROCK_EMBEDDING_MODEL=amazon.titan-embed-text-v2:0

# Cách B: Ollama local (miễn phí, không cần AWS)
USE_BEDROCK=false
OLLAMA_BASE_URL=http://host.docker.internal:11434
OLLAMA_LLM_MODEL=qwen2.5
OLLAMA_EMBEDDING_MODEL=mxbai-embed-large
```

### Bước 3: Chạy Docker Compose

```bash
docker compose up -d
```

Lần đầu sẽ build images (~5-10 phút). Sau đó các service sẽ khởi động:

| Service | Container | Port | Chức năng |
|---------|-----------|------|-----------|
| db | kon_postgres | 5432 | PostgreSQL + pgvector |
| worker | kon_worker | — | ETL + ML training (chạy nền) |
| api | kon_api | 8000 | FastAPI backend |
| web | kon_web | 3000 | Next.js frontend |

### Bước 4: Kiểm tra trạng thái

```bash
docker compose ps
```

Đợi cho đến khi tất cả service hiển thị `Up (healthy)`:

```
kon_postgres   Up (healthy)
kon_worker     Up
kon_api        Up (healthy)
kon_web        Up
```

> **Lưu ý:** Worker sẽ tự động load 3 datasets từ Kaggle và train ML models khi khởi động lần đầu. Quá trình này mất khoảng 3-5 phút.

### Bước 5: Truy cập ứng dụng

| URL | Mô tả |
|-----|-------|
| http://localhost:3000 | Trang chủ (Storefront) |
| http://localhost:3000/login | Đăng nhập |
| http://localhost:3000/dashboard | Admin Dashboard |
| http://localhost:8000/docs | Swagger API docs |
| http://localhost:8000/health | Health check |

### Tài khoản mặc định

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Admin (full access) |
| `client` | `client123` | Client (storefront only) |

---

## Cách 2: Chạy từng service riêng (Development)

Dùng khi muốn debug hoặc phát triển từng phần.

### 2.1 Database

```bash
docker compose up db -d
```

### 2.2 Backend (API)

```bash
# Terminal 1: API server
cd Kon
export PYTHONPATH=packages/db-core:packages/shared:packages/ai-engine:packages/mcp-servers
export DATABASE_URL=postgresql://nguyenhuudinh:kon_password@localhost:5432/kon_erp_northwind
export JWT_SECRET_KEY=my-super-secret-key-at-least-32-chars

uvicorn apps.api.main:app --reload --port 8000
```

### 2.3 Worker (ETL + ML)

```bash
# Terminal 2: Worker
cd Kon
export PYTHONPATH=packages/db-core:packages/shared:packages/ai-engine:packages/mcp-servers
export DATABASE_URL=postgresql://nguyenhuudinh:kon_password@localhost:5432/kon_erp_northwind

python apps/worker/main.py
```

### 2.4 Frontend

```bash
# Terminal 3: Next.js dev server
cd Kon
npm install          # Lần đầu
npm run dev          # Start dev server (port 3000)
```

---

## Cách 3: Dùng Ollama (AI Agent không cần AWS)

Nếu không có tài khoản AWS, dùng Ollama chạy AI local:

### Cài Ollama

```bash
# Linux/macOS
curl -fsSL https://ollama.com/install.sh | sh

# Windows: tải từ https://ollama.com/download
```

### Tải models

```bash
ollama pull qwen2.5          # LLM model (~4.7GB)
ollama pull mxbai-embed-large  # Embedding model (~670MB)
```

### Cấu hình .env

```env
USE_BEDROCK=false
OLLAMA_BASE_URL=http://host.docker.internal:11434
OLLAMA_LLM_MODEL=qwen2.5
OLLAMA_EMBEDDING_MODEL=mxbai-embed-large
```

Sau đó chạy Docker Compose bình thường. Agent sẽ dùng Ollama thay cho Bedrock.

---

## Các lệnh thường dùng

```bash
# Xem logs realtime
docker compose logs -f api        # Logs API
docker compose logs -f worker     # Logs Worker (ETL + ML)
docker compose logs -f web        # Logs Frontend

# Restart một service
docker compose restart api

# Rebuild sau khi sửa code
docker compose up -d --build web   # Rebuild frontend
docker compose up -d --build api   # Rebuild backend

# Dừng tất cả
docker compose down

# Dừng + xóa data (reset database)
docker compose down -v

# Xem trạng thái
docker compose ps
```

---

## Khắc phục lỗi thường gặp

### 1. Worker bị crash / restart liên tục

```bash
docker compose logs worker
```

**Nguyên nhân phổ biến:**
- Thiếu `KAGGLE_USERNAME` / `KAGGLE_KEY` trong `.env`
- Hết RAM (worker cần 2GB) → tăng Docker memory limit

### 2. API trả về 500 Internal Server Error

```bash
docker compose logs api
```

**Nguyên nhân phổ biến:**
- Database chưa có data (worker chưa chạy xong ETL)
- Thiếu `JWT_SECRET_KEY` trong `.env`

### 3. Frontend hiển thị "Failed to fetch"

- Kiểm tra API đang chạy: `curl http://localhost:8000/health`
- Kiểm tra `NEXT_PUBLIC_API_URL=http://localhost:8000` trong `.env`

### 4. AI Agent không trả lời

- **Nếu dùng Bedrock:** Kiểm tra AWS credentials còn valid
- **Nếu dùng Ollama:** Chạy `ollama list` để xác nhận models đã tải
- Xem logs: `docker compose logs api | grep -i "bedrock\|ollama\|agent"`

### 5. Port 5432/8000/3000 bị chiếm

```bash
# Linux/macOS
lsof -i :5432
kill -9 <PID>

# Hoặc đổi port trong docker-compose.yml
```

---

## Thứ tự khởi động

```
1. PostgreSQL (db)        → Khởi động trước, healthcheck mỗi 10s
2. Worker (worker)        → Đợi db healthy → Load ETL → Train ML
3. API (api)              → Đợi db healthy → Serve endpoints
4. Frontend (web)         → Đợi api healthy → Serve pages
```

Worker chạy xong ETL (~3-5 phút) → Database có data → Dashboard hiển thị đầy đủ.

---

## Cấu trúc thư mục quan trọng

```
Kon/
├── apps/
│   ├── web/           → Next.js 16 frontend (React 19, Tailwind 4)
│   ├── api/           → FastAPI backend (JWT, rate limiting)
│   └── worker/        → ETL pipeline + APScheduler (4h ML retrain)
├── packages/
│   ├── ui/            → 74 shadcn/Radix components
│   ├── ai-engine/     → ML models + LangGraph agent
│   ├── db-core/       → SQLAlchemy models + Alembic migrations
│   ├── shared/        → Pydantic schemas
│   └── mcp-servers/   → 7 agent tools
├── docker-compose.yml → 4 services orchestration
├── .env.example       → Template biến môi trường
└── docs/              → Diagrams, screenshots, slides
```
