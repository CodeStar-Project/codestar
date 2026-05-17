# Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build
FROM node:20-alpine AS build
WORKDIR /app
RUN npm install -g pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG JWT_SECRET
ARG AUTH_COOKIE_NAME=codestar_token
ARG SITE_URL=http://localhost:3000
ENV JWT_SECRET=$JWT_SECRET
ENV AUTH_COOKIE_NAME=$AUTH_COOKIE_NAME
ENV SITE_URL=$SITE_URL

ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# Runtime (standalone)
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"

RUN addgroup -S codestar && adduser -S codestar -G codestar

COPY --from=build --chown=codestar:codestar /app/.next/standalone ./
COPY --from=build --chown=codestar:codestar /app/.next/static ./.next/static
COPY --from=build --chown=codestar:codestar /app/public ./public

USER codestar

EXPOSE 3000
CMD ["node", "server.js"]
