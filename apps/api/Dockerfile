# Stage 1: Install dependencies
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-slim
WORKDIR /app

RUN useradd -m -r appuser

COPY --from=builder /install /usr/local

COPY packages/shared/ /app/packages/shared/
COPY packages/db-core/ /app/packages/db-core/
COPY packages/mcp-servers/ /app/packages/mcp-servers/
COPY packages/ai-engine/ /app/packages/ai-engine/
COPY apps/api/ /app/apps/api/

ENV PYTHONPATH=/app/packages/db-core:/app/packages/shared:/app/packages/ai-engine:/app/packages/mcp-servers:/app/apps/api:/app

USER appuser
EXPOSE 8000
CMD ["uvicorn", "apps.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
