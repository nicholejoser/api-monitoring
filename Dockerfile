# =========================================
# Stage 1: Dependencies
# =========================================

FROM node:24-bookworm-slim AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci


# =========================================
# Stage 2: Build
# =========================================

FROM node:24-bookworm-slim AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build


# =========================================
# Stage 3: Production
# =========================================

FROM node:24-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

ENV NEXT_TELEMETRY_DISABLED=1

ENV PORT=3000

ENV HOSTNAME=0.0.0.0


# Create a non-root user

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs


# Copy standalone application

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy static assets

COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy public files

COPY --from=builder --chown=nextjs:nodejs /app/public ./public


USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]