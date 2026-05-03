# Aşama 1: Build (Derleme)
FROM node:22-alpine AS builder

WORKDIR /app

# Bağımlılıkları kopyala ve kur
COPY package.json package-lock.json ./
RUN npm ci

# Kaynak kodunu kopyala ve projeyi derle
COPY . .
# .env dosyaları frontend build aşamasında VITE_ prefixiyle kodun içine gömülür.
# Production build komutunu çalıştır
RUN npm run build

# Aşama 2: Serve (Sunum - Nginx ile)
FROM nginx:alpine

# Nginx ayarlarını (React Router SPA için gerekli) kopyalayacağız
# Varsayılan nginx public klasörünü sil
RUN rm -rf /usr/share/nginx/html/*

# Builder aşamasından elde edilen statik dosyaları (dist klasörü) kopyala
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA yönlendirmeleri için Nginx ayarını kopyala
# LocalShop projesinde frontend/ dizininde bir nginx.conf oluşturacağız
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
