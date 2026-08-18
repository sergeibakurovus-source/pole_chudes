# -------------------------------------------------------------
# Google Cloud Run Optimized Dockerfile
# Base: nginx:alpine (lightweight, secure, < 30MB)
# -------------------------------------------------------------
FROM nginx:alpine

# Set working directory for static assets
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy project static assets
COPY src/ .

# Copy Nginx template for dynamic $PORT substitution by envsubst
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Default fallback PORT if not provided by Cloud Run
ENV PORT=8080

# Expose standard Cloud Run port
EXPOSE 8080

# Health check instruction for local docker verification
HEALTHCHECK --interval=30s --timeout=3s --start-period=2s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:${PORT}/healthz || exit 1

# Standard Nginx startup (envsubst runs automatically on /etc/nginx/templates/*.template)
CMD ["nginx", "-g", "daemon off;"]
