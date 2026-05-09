# Stage 1: Build
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-slim
WORKDIR /app

# Create non-root user
RUN useradd -m -r appuser

COPY --from=builder /install /usr/local
COPY packages/db-core/ /app/packages/db-core/
COPY packages/shared/ /app/packages/shared/
COPY packages/ai-engine/ /app/packages/ai-engine/
COPY packages/mcp-servers/ /app/packages/mcp-servers/
COPY apps/worker/ /app/apps/worker/

ENV PYTHONPATH=/app/packages/db-core:/app/packages/shared:/app/packages/ai-engine:/app/packages/mcp-servers:/app

USER appuser
CMD ["python", "apps/worker/main.py"]
