FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Set production environment and increase memory
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096 --openssl-legacy-provider"

# Install dependencies (production only)
RUN yarn install --frozen-lockfile --production=true

COPY . .

# Build the app for production
RUN yarn build

EXPOSE 8000

ENV PORT=8000

# Serve the built files with a simple static server
CMD ["npx", "serve", "dist", "-l", "8000", "-s"]
