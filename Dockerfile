# node version
FROM node:22

# set the working directory
WORKDIR /app

# Copy package files and prisma schema before installing
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts

# Skip postinstall during image build (scripts/ not copied yet; no DATABASE_URL here)
RUN npm ci --ignore-scripts
RUN npx prisma generate

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