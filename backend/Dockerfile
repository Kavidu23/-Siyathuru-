# Use Node.js base image
FROM node:20

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json first (layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm install -g nodemon

# Copy all backend source code
COPY . .

# Expose backend port
EXPOSE 3000 

# Start the backend server
CMD ["npm", "start"]
