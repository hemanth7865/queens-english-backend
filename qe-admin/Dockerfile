FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096 --openssl-legacy-provider"

RUN yarn install --frozen-lockfile

COPY . .

RUN npm install umi@3 --legacy-peer-deps
RUN npx umi build

RUN yarn global add serve

EXPOSE 10000

CMD ["serve", "-s", "dist", "-l", "10000"]
