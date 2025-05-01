FROM node:18-alpine AS build
WORKDIR /app
 
# Copy package.json and package-lock.json (if they exist)
COPY package*.json ./
 
# Install dependencies
RUN npm install
 
# Copy the rest of the app and the .env file
COPY . .
 
# Build the React app (this will use the .env for build-time variables)
RUN npm run build
 
# Stage 2: Serve the app using `serve`
FROM node:18-alpine
 
WORKDIR /app
 
# Install `serve` globally
RUN npm install -g serve
 
# Copy the build output from the previous stage
COPY --from=build /app/build /app/build
 
# Expose port 80
EXPOSE 80
 
# Start serving the app
CMD ["serve", "-s", "build", "-l", "tcp://0.0.0.0:80"]
