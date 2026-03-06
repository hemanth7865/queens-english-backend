FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN yarn install --production=false

COPY . .

EXPOSE 8000

ENV NODE_ENV=production
ENV PORT=8000

CMD ["yarn", "start"]
