FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json ./

RUN npm install

# Copy rest of project
COPY . .

# Build Nuxt
RUN npm run build

# Expose port
EXPOSE 3000

# Run Nuxt production server
CMD ["sh", "-c", "npm run db:migrate && node .output/server/index.mjs"]