FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096 --openssl-legacy-provider"

# Install without running scripts (umi g tmp will fail)
RUN yarn install --frozen-lockfile --ignore-scripts

COPY . .

# Build the app
RUN yarn build

EXPOSE 8000

ENV PORT=8000

# Serve static files
CMD ["npx", "serve", "dist", "-l", "8000", "-s"]
