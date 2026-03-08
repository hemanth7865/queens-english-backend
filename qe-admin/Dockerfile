FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npx umi build

RUN npm install -g serve

EXPOSE 8000

CMD ["serve", "-s", "dist", "-l", "8000", "--single"]
