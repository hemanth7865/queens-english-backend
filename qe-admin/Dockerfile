FROM node:18-alpine

WORKDIR /app

COPY package.json ./

RUN npm install --legacy-peer-deps

COPY . .

ENV NODE_OPTIONS=--openssl-legacy-provider

RUN npm run build

EXPOSE 8000

CMD ["npm","run","serve"]
