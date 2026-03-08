FROM node:16-alpine

WORKDIR /app

# copy package files first (better caching)
COPY package*.json ./

# install dependencies
RUN npm install --legacy-peer-deps

# copy rest of project
COPY . .

# build frontend (avoid NODE_OPTIONS error)
RUN npx umi build

# install lightweight server
RUN npm install -g serve

EXPOSE 3000

# serve built frontend
CMD ["serve", "-s", "dist", "-l", "3000"]
