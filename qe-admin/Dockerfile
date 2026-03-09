FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Environment variables
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096 --openssl-legacy-provider"

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy project
COPY . .

# Build project
RUN npx umi build

# Install serve
RUN yarn global add serve

EXPOSE 10000

CMD ["serve", "-s", "dist", "-l", "10000"]
