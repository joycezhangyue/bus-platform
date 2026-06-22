FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install --production

# Copy built frontend and server
COPY dist ./dist
COPY server ./server

# Create data directory
RUN mkdir -p /app/server/data

EXPOSE 3001

ENV PORT=3001
ENV NODE_ENV=production

CMD ["node", "server/index.js"]