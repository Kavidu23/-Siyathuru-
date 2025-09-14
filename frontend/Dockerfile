# Base image with Node.js
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files (so you can install deps later if needed)
COPY package*.json ./

# Install dependencies (optional, can comment out if not needed yet)
# RUN npm install

# Copy the rest of the project (source code)
COPY . .

# Expose Angular default port (optional)
EXPOSE 4200

# Default command (placeholder)
CMD ["node"]
