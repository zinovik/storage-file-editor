FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY lib ./lib
COPY app ./app
COPY public ./public
COPY tsconfig.json ./
COPY next.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.mjs ./
RUN npm run build

###

FROM node:24-alpine

WORKDIR /app

# add non‑root user
RUN addgroup -S app && adduser -S app -G app
USER app

ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
