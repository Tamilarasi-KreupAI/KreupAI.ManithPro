# KreupAI ManithPro - Frontend Dockerfile
# Multi-stage build for optimized production images

# =============================================================================
# Base Stage - Common dependencies
# =============================================================================
FROM node:20-alpine AS base

# Install essential system dependencies
RUN apk add --no-cache libc6-compat curl

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# =============================================================================
# Dependencies Stage - Install all dependencies
# =============================================================================
FROM base AS dependencies

# Install all dependencies (including devDependencies)
RUN npm ci

# =============================================================================
# Development Stage - For local development with hot reload
# =============================================================================
FROM dependencies AS development

ENV NODE_ENV=development

# Copy source code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start development server with hot reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# =============================================================================
# Builder Stage - Build production assets
# =============================================================================
FROM dependencies AS builder

# Set build-time environment variables
ARG VITE_API_URL
ARG VITE_WS_URL
ENV VITE_API_URL=${VITE_API_URL:-/api}
ENV VITE_WS_URL=${VITE_WS_URL:-/ws}

# Copy source code
COPY . .

# Build production assets
RUN npm run build

# =============================================================================
# Production Stage - Serve with nginx
# =============================================================================
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Remove default nginx config
RUN rm -rf /etc/nginx/conf.d/*

# Copy custom nginx config for SPA
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add non-root user
RUN addgroup -g 1001 -S nginx-group && \
    chown -R nginx:nginx-group /usr/share/nginx/html && \
    chown -R nginx:nginx-group /var/cache/nginx && \
    chown -R nginx:nginx-group /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx-group /var/run/nginx.pid

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# =============================================================================
# Preview Stage - For testing production build locally
# =============================================================================
FROM dependencies AS preview

ENV NODE_ENV=production

# Copy source and build
COPY . .
RUN npm run build

# Expose preview server port
EXPOSE 5173

# Start preview server
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
