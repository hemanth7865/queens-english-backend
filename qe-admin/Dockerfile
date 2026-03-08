FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Increase memory limit
ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN yarn install --production=false

COPY . .

# Build for production
RUN yarn build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install serve to run the built app
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/dist ./dist

EXPOSE 8000

ENV NODE_ENV=production
ENV PORT=8000

# Serve the built files
CMD ["serve", "-s", "dist", "-l", "8000"]
