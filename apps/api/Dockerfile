FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY packages/ /app/packages/
COPY apps/api/ /app/apps/api/

ENV PYTHONPATH="/app/packages/db-core:/app/packages/shared:${PYTHONPATH}"

CMD ["python", "apps/api/main.py"]
