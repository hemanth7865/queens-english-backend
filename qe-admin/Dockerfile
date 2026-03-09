FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096 --openssl-legacy-provider"

RUN npm install --legacy-peer-deps

COPY . .

RUN npx umi@3 build

RUN npm install -g serve

EXPOSE 10000

CMD ["serve", "-s", "dist", "-l", "10000"]
