FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY src ./src

RUN mkdir -p uploads/videos uploads/audio uploads/voiceovers uploads/projects logs && \
    chown -R node:node /app

USER node

EXPOSE 4000

CMD ["node", "src/server.js"]
