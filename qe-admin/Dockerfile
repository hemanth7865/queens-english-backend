FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096 --openssl-legacy-provider"

# Install ALL dependencies (don't skip scripts)
RUN yarn install --frozen-lockfile

COPY . .

# Build for production
RUN yarn build

EXPOSE 8000

ENV PORT=8000

# Serve the built app
CMD ["npx", "serve", "dist", "-l", "8000", "-s"]
