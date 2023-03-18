# Specify the Node.js version to use as base image
FROM node:16-alpine

# Set a working directory for the app
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install the app's dependencies
RUN npm install

# Copy the rest of the app's files to the working directory
COPY . .

# Expose the port used by the app (3000)
EXPOSE 3000

# Start the app with the "npm start" command
CMD ["npm", "start"]