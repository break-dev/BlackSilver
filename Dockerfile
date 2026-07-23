# Stage 1: Build (React 19 + Vite)
FROM node:20-alpine AS builder

WORKDIR /app

# Asigna 4GB de RAM a Node.js para transpilar a máxima velocidad
ENV NODE_OPTIONS="--max-old-space-size=4096"

COPY package.json package-lock.json ./

# Descarga acelerada: omite auditorías y comprobaciones innecesarias
RUN --mount=type=cache,target=/root/.npm \
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

# Caché incremental de Vite + React Compiler
RUN --mount=type=cache,target=/app/node_modules/.cache \
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