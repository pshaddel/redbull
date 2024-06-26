# Use an official Node runtime as the base image - alpine is a lightweight version of node
# node 20 alpine
FROM node:20-alpine

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm i --ignore-scripts

# Copy the rest of the application code to the working directory
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

RUN npm prune --production

# Make port 8080 available to the world outside this container
EXPOSE 3001

# Run the app when the container launches
CMD [ "node", "dist/src/app.js" ]