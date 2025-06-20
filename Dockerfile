FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js app
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app


# ✅ Tambahkan semua build arguments
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_API_ROUTE
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_ML_API_URL
ARG NEXT_PUBLIC_API_TIMEOUT
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
ARG NEXT_PUBLIC_MAX_FILE_SIZE
ARG NEXT_PUBLIC_ALLOWED_FILE_TYPES
ARG NEXT_PUBLIC_ENABLE_IMAGE_UPLOAD
ARG NEXT_PUBLIC_ENABLE_RICH_TEXT_EDITOR

# ✅ Set sebagai environment variables
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_API_ROUTE=$NEXT_PUBLIC_API_ROUTE
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_ML_API_URL=$NEXT_PUBLIC_ML_API_URL
ENV NEXT_PUBLIC_API_TIMEOUT=$NEXT_PUBLIC_API_TIMEOUT
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID
ENV NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=$NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
ENV NEXT_PUBLIC_MAX_FILE_SIZE=$NEXT_PUBLIC_MAX_FILE_SIZE
ENV NEXT_PUBLIC_ALLOWED_FILE_TYPES=$NEXT_PUBLIC_ALLOWED_FILE_TYPES
ENV NEXT_PUBLIC_ENABLE_IMAGE_UPLOAD=$NEXT_PUBLIC_ENABLE_IMAGE_UPLOAD
ENV NEXT_PUBLIC_ENABLE_RICH_TEXT_EDITOR=$NEXT_PUBLIC_ENABLE_RICH_TEXT_EDITOR

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 1801
ENV PORT 1801

CMD ["node", "server.js"]