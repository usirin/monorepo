FROM node:24-alpine

# Install pnpm
RUN corepack enable

WORKDIR /monorepo

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/*/package.json ./packages/*/
COPY services/*/package.json ./services/*/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build packages if needed
RUN pnpm build

EXPOSE 3000

WORKDIR /monorepo/services/armut

CMD ["pnpm", "run", "dev"]