# syntax=docker/dockerfile:1
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Development stage (includes dev dependencies)
FROM base AS development
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nodeuser

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY src/ ./src/
COPY package*.json ./

# Set correct permissions
RUN chown -R nodeuser:nodejs /app

# Switch to non-root user
USER nodeuser

# Build metadata
ARG NODE_ENV=production
ARG BUILD_DATE
ARG GIT_COMMIT

ENV NODE_ENV=${NODE_ENV}
ENV PORT=3000

LABEL org.opencontainers.image.created=${BUILD_DATE}
LABEL org.opencontainers.image.revision=${GIT_COMMIT}
LABEL org.opencontainers.image.title="cicd-test-automation"
LABEL org.opencontainers.image.description="CI/CD Test Automation Case Study API"

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]
