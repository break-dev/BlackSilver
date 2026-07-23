# Stage 1: Build (React 19 + Vite)
# Usamos node:20-slim (glibc) en lugar de alpine (musl) para transpilaciones pesadas
FROM node:20-slim AS builder

WORKDIR /app

ENV NODE_OPTIONS="--max-old-space-size=4096"

COPY package.json package-lock.json ./

# Cachea la carpeta node_modules directamente para omitir la descomprensión en disco
RUN --mount=type=cache,target=/root/.npm \
    --mount=type=cache,target=/app/node_modules \
    npm ci --prefer-offline --no-audit --no-fund

COPY . .

ARG VITE_API_URL
ARG VITE_REVERB_APP_KEY
ARG VITE_REVERB_HOST
ARG VITE_REVERB_PORT
ARG VITE_REVERB_SCHEME

ENV VITE_API_URL=$VITE_API_URL \
    VITE_REVERB_APP_KEY=$VITE_REVERB_APP_KEY \
    VITE_REVERB_HOST=$VITE_REVERB_HOST \
    VITE_REVERB_PORT=$VITE_REVERB_PORT \
    VITE_REVERB_SCHEME=$VITE_REVERB_SCHEME

# Ejecuta vite build usando el cache de node_modules y .vite
RUN --mount=type=cache,target=/app/node_modules \
    --mount=type=cache,target=/app/node_modules/.cache \
    --mount=type=cache,target=/app/node_modules/.vite \
    npx vite build

# Stage 2: Producción con Nginx
FROM nginx:alpine

RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    gzip on; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml; \
    location /assets/ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    location / { \
        try_files $uri $uri/ /index.html; \
        add_header Cache-Control "no-store, no-cache, must-revalidate"; \
    } \
}' > /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]