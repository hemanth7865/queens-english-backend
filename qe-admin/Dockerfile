FROM node:16-alpine

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./

# Install EXACT versions from lockfile
RUN npm ci --legacy-peer-deps

# Copy project
COPY . .

# Build Umi project
RUN npx umi build

# Install static server
RUN npm install -g serve

EXPOSE 8000

# Serve built app with SPA routing
CMD ["serve", "-s", "dist", "-l", "8000"]
