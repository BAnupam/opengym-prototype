FROM node:22-alpine

WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN corepack enable && pnpm install --frozen-lockfile

COPY apps/api apps/api
COPY packages/shared packages/shared

RUN pnpm --filter @opengym/api run build

EXPOSE 3001

CMD ["pnpm", "--filter", "@opengym/api", "run", "start"]
