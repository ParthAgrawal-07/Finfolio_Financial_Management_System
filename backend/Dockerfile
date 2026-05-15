FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src

EXPOSE 3001

# Development: use ts-node-dev for hot-reload
CMD ["npm", "run", "dev"]
