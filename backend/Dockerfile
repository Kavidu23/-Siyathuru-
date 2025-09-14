# Use Node.js base image
FROM node:20

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json first (layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all backend source code
COPY . .

# Expose backend port
EXPOSE 4000

# Start the backend
CMD ["npm", "start"]
