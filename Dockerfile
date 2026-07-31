# Imagem de produção da Agenda. Serve para Railway, Render, Fly.io ou
# qualquer servidor com Docker. Os dados ficam no volume montado em /data.

FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    AGENDA_DATA_DIR=/data \
    NEXT_PUBLIC_APP_TIMEZONE=America/Sao_Paulo

RUN addgroup -g 1001 -S agenda \
    && adduser -S -u 1001 -G agenda agenda \
    && mkdir -p /data \
    && chown -R agenda:agenda /data

# O servidor standalone não copia estes dois diretórios sozinho.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=agenda:agenda /app/.next/standalone ./
COPY --from=builder --chown=agenda:agenda /app/.next/static ./.next/static

USER agenda
EXPOSE 3000
VOLUME ["/data"]

CMD ["node", "server.js"]
