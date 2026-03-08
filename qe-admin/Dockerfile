FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Set environment variables
ENV NODE_OPTIONS="--max-old-space-size=4096 --openssl-legacy-provider"
ENV NODE_ENV=production

# Install dependencies
RUN yarn install --frozen-lockfile --production=true

COPY . .

# Build the app
RUN yarn build

EXPOSE 8000

ENV PORT=8000

# Serve the built files
CMD ["npx", "serve", "dist", "-l", "8000", "-s"]
