# node version
FROM node:22

# set the working directory
WORKDIR /app

# Copy package files and prisma schema before installing so postinstall can run
COPY package*.json ./
COPY prisma ./prisma

# Install deps (includes dev deps so we can build the frontend), generate Prisma client
RUN npm ci

# Copy rest of app files
COPY . .

# Build the frontend
RUN npm run build

# Write build-info into `dist` so deployed image can be verified
RUN node scripts/write-build-info.js

# Remove dev deps to slim image (keep production deps incl. prisma)
RUN npm prune --production

# expose the backend port
EXPOSE 5000

# Start the production server
ENV NODE_ENV=production
#CMD ["node", "src/server/server.js"]
CMD ["sh", "-c", "npx prisma migrate deploy --schema=prisma/schema.prisma && node src/server/server.js"]