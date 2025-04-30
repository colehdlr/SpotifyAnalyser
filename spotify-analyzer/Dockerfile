FROM node:18-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy all files
COPY . .

# Build the app
RUN npm run build

# Install serve
RUN npm install -g serve

EXPOSE 3000
EXPOSE 80
# Use serve with the correct options
CMD ["serve", "-s", "build", "-l", "tcp://0.0.0.0:80"]
