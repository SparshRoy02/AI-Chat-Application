# Use official Node.js LTS lightweight image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package manifests first to leverage Docker layer caching
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose backend port
EXPOSE 5000

# Default environment variables
ENV NODE_ENV=production \
    PORT=5000

# Start server
CMD ["npm", "start"]
