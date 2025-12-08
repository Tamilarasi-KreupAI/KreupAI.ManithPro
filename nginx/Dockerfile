# KreupAI ManithPro - Nginx Reverse Proxy Dockerfile

FROM nginx:1.25-alpine

# Install dependencies for health checks
RUN apk add --no-cache curl openssl

# Remove default nginx configuration
RUN rm -rf /etc/nginx/conf.d/*

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Create log directory with proper permissions
RUN mkdir -p /var/log/nginx && \
    chown -R nginx:nginx /var/log/nginx

# Add custom error pages (optional)
COPY --chown=nginx:nginx error-pages /usr/share/nginx/html/error-pages 2>/dev/null || true

# Expose HTTP and HTTPS ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
