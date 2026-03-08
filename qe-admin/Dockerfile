FROM node:20-alpine

# Set working directory
WORKDIR /app

# Environment
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096 --openssl-legacy-provider"

# Copy package files first
COPY package.json yarn.lock* package-lock.json* ./

# Install dependencies
RUN yarn install

# Copy the rest of the project
COPY . .

# Build using project script
RUN yarn build

# Install static server
RUN yarn global add serve

# Expose port
EXPOSE 8000
ENV PORT=8000

# Start the frontend
CMD ["serve", "-s", "dist", "-l", "8000"]
