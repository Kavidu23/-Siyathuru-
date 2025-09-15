# Step 1: Build Angular app
FROM node:20 AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source code
COPY . .

# Build Angular app into dist/frontend/browser
RUN npm run build --output-path=dist/frontend/browser

# Step 2: Serve with Nginx
FROM nginx:alpine

# Copy built Angular files into Nginx html folder
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Expose container port
EXPOSE 80

# Run Nginx
CMD ["nginx", "-g", "daemon off;"]
