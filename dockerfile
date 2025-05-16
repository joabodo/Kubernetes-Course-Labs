FROM node:18-alpine

WORKDIR /app

# Install curl for healthcheck
RUN apk --no-cache add curl


# Copy package files and install dependencies
COPY package*.json ./
RUN npm install


# Copy application code
COPY server.js ./
COPY simplevotingapp.html ./


# Expose the port the app runs on
EXPOSE 8080


# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1


# Command to run the application
CMD ["node", "server.js"]
