FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Install ALL dependencies (including dev deps like ts-node)
RUN npm install

COPY . .

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV NODE_OPTIONS=--openssl-legacy-provider

CMD ["npm", "start"]
