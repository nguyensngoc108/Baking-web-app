# Multi-stage build for Baking Shop Server
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files from server directory
COPY server/package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Final stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init to handle proper signal forwarding
RUN apk add --no-cache dumb-init

# Copy built node_modules from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy application code from server directory
COPY server/ .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to run node
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "index.js"]
