# Python 3.12 tabanlı resmi ve hafif bir imaj kullanıyoruz
FROM python:3.12-slim

# Ortam değişkenleri
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Çalışma dizinini ayarla
WORKDIR /app

# Sistem bağımlılıklarını kur (psycopg2 için gerekli olabilir)
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Bağımlılıkları kopyala ve kur
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Uygulama kodunu kopyala
COPY . .

# FastAPI uygulamasını başlatacak komut
# Host 0.0.0.0 olmalı ki container dışından (Nginx) erişilebilsin
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
