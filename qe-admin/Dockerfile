# ---------- Stage 1: Build ----------
FROM node:20-alpine AS builder

WORKDIR /app

ENV NODE_OPTIONS="--openssl-legacy-provider"

# Install umi + required plugins
RUN yarn global add umi \
    @umijs/preset-react \
    @umijs/plugin-access \
    @umijs/plugin-model \
    @umijs/plugin-locale

# Copy dependency files
COPY package.json yarn.lock* package-lock.json* ./

RUN yarn install

COPY . .

# Build
RUN umi build


# ---------- Stage 2: Production ----------
FROM node:20-alpine

WORKDIR /app

RUN yarn global add serve

COPY --from=builder /app/dist ./dist

EXPOSE 8000

CMD ["serve", "-s", "dist", "-l", "8000"]
