FROM node:20-alpine

WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./

# Set environment variables
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096 --openssl-legacy-provider"

# Install ALL dependencies (devDependencies needed for build)
# Use --ignore-scripts to skip postinstall that runs "umi g tmp" before umi is installed
RUN yarn install --frozen-lockfile --ignore-scripts

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
