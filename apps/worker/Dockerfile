FROM python:3.11-slim

WORKDIR /app

# Cài đặt system dependencies cho psycopg2 và các thư viện khác
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Sao chép file requirements và cài đặt phụ thuộc
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Sao chép mã nguồn theo cấu trúc Monorepo
COPY packages/ /app/packages/
COPY apps/worker/ /app/apps/worker/

# Thiết lập PYTHONPATH để nhận diện local packages
ENV PYTHONPATH="/app/packages/db-core:/app/packages/shared:${PYTHONPATH}"

CMD ["python", "apps/worker/main.py"]
