# Use an official Node.js runtime as the base image
FROM node:14-alpine AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# RUN npm install -g npm@latest

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .


# Build the frontend application
RUN npm run build

# Use Nginx as the base image for serving the frontend
FROM nginx:alpine

# Copy the built frontend files from the builder stage to the Nginx server directory
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx to serve the frontend
CMD ["nginx", "-g", "daemon off;"]