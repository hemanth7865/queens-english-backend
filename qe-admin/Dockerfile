FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Set environment
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096 --openssl-legacy-provider"

# Install ALL dependencies
RUN yarn install --frozen-lockfile

COPY . .

# Build using yarn (not direct umi command)
RUN yarn build

EXPOSE 8000

ENV PORT=8000

# Serve the built files
CMD ["npx", "serve", "dist", "-l", "8000", "-s"]
