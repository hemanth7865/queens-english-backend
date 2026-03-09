FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# FIXED: Use npm run build (uses local umi from node_modules)
RUN npm run build

RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "dist"]
