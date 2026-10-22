FROM node:22.11.0-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production

RUN addgroup -S nodejs && adduser -S appuser -G nodejs
USER appuser

EXPOSE 5000

CMD ["node", "backend/index.js"]