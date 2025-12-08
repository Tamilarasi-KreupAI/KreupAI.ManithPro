# KreupAI ManithPro - Backend Dockerfile
# Multi-stage build for optimized production images

# =============================================================================
# Base Stage - Common dependencies
# =============================================================================
FROM node:20-alpine AS base

# Install essential system dependencies
RUN apk add --no-cache \
    libc6-compat \
    openssl \
    curl \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY prisma ./prisma/

# =============================================================================
# Dependencies Stage - Install all dependencies
# =============================================================================
FROM base AS dependencies

# Install all dependencies (including devDependencies)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# =============================================================================
# Development Stage - For local development with hot reload
# =============================================================================
FROM dependencies AS development

ENV NODE_ENV=development

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start development server with hot reload
CMD ["npm", "run", "dev"]

# =============================================================================
# Builder Stage - Compile TypeScript
# =============================================================================
FROM dependencies AS builder

# Copy source code
COPY . .

# Build TypeScript to JavaScript
RUN npm run build

# Prune devDependencies for production
RUN npm prune --production

# =============================================================================
# Production Stage - Minimal production image
# =============================================================================
FROM node:20-alpine AS production

# Add non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Install runtime dependencies only
RUN apk add --no-cache \
    openssl \
    curl \
    dumb-init \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# Create uploads directory
RUN mkdir -p uploads && chown -R nodejs:nodejs uploads

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start production server
CMD ["node", "dist/index.js"]
