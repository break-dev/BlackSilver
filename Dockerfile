# Stage 1: Build
FROM node:20-alpine AS builder

# Variables de entorno BUILD-TIME (Vite las congela en el bundle).
# Se inyectan desde Coolify como Build Args distintos por environment (front / front-dev).
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

WORKDIR /app

# Copiar archivos de dependencias para aprovechar la caché de Docker
COPY package.json package-lock.json ./

# Instalar dependencias usando npm ci (más rápido y limpio para CI/CD/Docker)
RUN npm ci

# Copiar el resto del código del frontend
COPY . .

# Compilar el proyecto Vite (genera la carpeta /app/dist)
RUN npx vite build

# Stage 2: Production (servido con Nginx)
FROM nginx:alpine

# Configuración Nginx optimizada para SPA (React Router fallback)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Copiar los archivos compilados del stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
