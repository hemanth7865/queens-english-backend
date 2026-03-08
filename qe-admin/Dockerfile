# ---------- Build stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

ENV NODE_OPTIONS="--openssl-legacy-provider"

# Install umi + preset-react
RUN yarn global add umi @umijs/preset-react

# Copy package files
COPY package.json yarn.lock* package-lock.json* ./

# Install dependencies
RUN yarn install

# Copy source
COPY . .

# Build project
RUN umi build


# ---------- Production stage ----------
FROM node:20-alpine

WORKDIR /app

RUN yarn global add serve

COPY --from=builder /app/dist ./dist

EXPOSE 8000

CMD ["serve", "-s", "dist", "-l", "8000"]
