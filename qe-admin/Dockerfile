FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with yarn
RUN yarn install --production=false

# Copy all source files
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Set environment
ENV NODE_ENV=production
ENV PORT=8000

# Start the application
CMD ["yarn", "start"]
