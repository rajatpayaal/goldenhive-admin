# ==========================================
# Vite + React Dockerfile (Nginx for SPA)
# ==========================================

# 1. Build Stage
FROM node:22-alpine AS builder
WORKDIR /app

# Allow overriding API base at build time:
# docker build --build-arg VITE_API_URL=http://localhost:8000/api ...
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Install dependencies first (better caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the code and build
COPY . .
RUN npm run build

# 2. Production Stage (Nginx)
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add basic nginx config for React Router / SPA fallback
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
