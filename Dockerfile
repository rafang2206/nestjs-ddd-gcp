# Etapa base
FROM node:22-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate


# Etapa de dependencias (instalación)
FROM base AS deps
WORKDIR /usr/src/app

COPY pnpm-lock.yaml package.json ./
RUN pnpm fetch


# Etapa de build (compilación)
FROM deps AS build
WORKDIR /usr/src/app

COPY . .
ENV CI=true
RUN pnpm install --offline --prod=false
RUN pnpm run build


# Etapa final (producción)
FROM base AS prod
WORKDIR /app

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package.json ./package.json

EXPOSE 8080
CMD ["pnpm", "start:prod"]
