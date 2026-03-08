FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Increase Node.js memory limit
ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN yarn install --production=false

COPY . .

EXPOSE 8000

ENV NODE_ENV=production
ENV PORT=8000
ENV NODE_OPTIONS="--max-old-space-size=4096 --openssl-legacy-provider"

CMD ["yarn", "start"]
