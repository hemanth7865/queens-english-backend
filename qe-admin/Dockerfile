# ---------- Stage 1: Build ----------
FROM node:20-alpine AS builder

WORKDIR /app

ENV NODE_OPTIONS="--openssl-legacy-provider"

# Install Umi CLI
RUN yarn global add umi

# Copy dependency files first (better cache)
COPY package.json yarn.lock* package-lock.json* ./

# Install dependencies
RUN yarn install

# Copy source code
COPY . .

# Build the frontend
RUN umi build


# ---------- Stage 2: Production ----------
FROM node:20-alpine

WORKDIR /app

# Install lightweight static server
RUN yarn global add serve

# Copy only built files from builder
COPY --from=builder /app/dist ./dist

EXPOSE 8000
ENV PORT=8000

CMD ["serve", "-s", "dist", "-l", "8000"]
