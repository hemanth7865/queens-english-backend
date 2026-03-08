FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install umi CLI globally
RUN yarn global add umi

# Copy dependency files first (better docker caching)
COPY package.json yarn.lock* package-lock.json* ./

# Environment settings
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096 --openssl-legacy-provider"

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy remaining project files
COPY . .

# Build the frontend
RUN umi build

# Expose port
EXPOSE 8000

# Runtime port for Render
ENV PORT=8000

# Serve built files
RUN yarn global add serve

CMD ["serve", "-s", "dist", "-l", "8000"]
