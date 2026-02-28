# Stage 1: Dependencies & Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Install ALL dependencies for potential build steps (even though backend is mostly JS, this ensures robust install)
RUN npm ci

# Stage 2: Runner
FROM node:18-alpine AS runner
WORKDIR /app

# Install system dependencies needed at runtime
RUN apk add --no-cache ffmpeg

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy package.json for production install
COPY package*.json ./
# Install ONLY production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Setup permissions for uploads and archive directories
RUN mkdir -p /app/uploads /app/archive && chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

EXPOSE 5000
CMD ["node", "app.js"]