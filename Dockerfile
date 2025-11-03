FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --production || npm install --production

COPY . .

ENV PORT=7575
EXPOSE 7575

CMD ["npm","start"]
