FROM node:20-alpine

WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./

# Set environment variables
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096 --openssl-legacy-provider"

# Install dependencies (postinstall is "echo skipped" - no umi g tmp)
RUN npm install --production=false

# Copy source code
COPY . .

# Build using the locally installed umi (via npm script)
RUN npm run build

# Install serve for static file hosting
RUN npm install -g serve

EXPOSE 8000

ENV PORT=8000

# Serve the built dist folder
CMD ["serve", "dist", "-l", "8000"]
