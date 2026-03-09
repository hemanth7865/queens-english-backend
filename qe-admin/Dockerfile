FROM node:20-alpine

WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./
COPY yarn.lock ./ 2>/dev/null || true

# Set environment variables
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096 --openssl-legacy-provider"

# Install ALL dependencies (devDependencies needed for build)
# postinstall is skipped, so no umi g tmp error
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build for production (umi build handles everything)
RUN yarn build

# Install serve for static file hosting
RUN npm install -g serve

EXPOSE 8000

ENV PORT=8000

# Serve the built dist folder
CMD ["serve", "dist", "-l", "8000"]
