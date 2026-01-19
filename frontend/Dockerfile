# ============================================
# Build Stage
# ============================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install security updates and required packages
RUN apk update && \
  apk upgrade && \
  apk add --no-cache libc6-compat && \
  rm -rf /var/cache/apk/*

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies with clean cache
RUN npm ci --only=production=false && \
  npm cache clean --force

# Copy source code and configuration files
COPY . .

# Build the application
RUN npm run build
COPY ./src/assets/*  dist/assets

# ============================================
# Production Stage
# ============================================
FROM nginx:1.27-alpine AS production

# Install security updates
RUN apk update && \
  apk upgrade && \
  apk add --no-cache curl && \
  rm -rf /var/cache/apk/*

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create necessary directories and set permissions
# Nginx runs as root initially to bind to port 80, then drops to nginx user
RUN mkdir -p /var/cache/nginx /var/log/nginx /etc/nginx/conf.d && \
  chown -R nginx:nginx /usr/share/nginx/html && \
  chown -R nginx:nginx /var/cache/nginx && \
  chown -R nginx:nginx /var/log/nginx && \
  chmod -R 755 /usr/share/nginx/html && \
  chmod -R 755 /var/cache/nginx && \
  chmod -R 755 /var/log/nginx

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

