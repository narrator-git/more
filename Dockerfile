# Use Debian slim so better-sqlite3 has prebuilt binaries (Alpine/musl does not)
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Ensure data directory exists and is writable
RUN mkdir -p /app/data && chmod 777 /app/data

EXPOSE 3000

CMD ["node", "server.js"]
