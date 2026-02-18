# node version
FROM node:22

# set the working directory
WORKDIR /app

# Copy the package.json and the package-lock.json files to the container
COPY package*.json ./

# Copy prisma schema so `prisma generate` can run during install
COPY prisma ./prisma

# run npm install
RUN npm install

# copy the rest of the files in the project
COPY . .

# expose the port the app runs on
EXPOSE 5173

# Define the command to run the application
CMD ["npm", "run", "dev:all"]