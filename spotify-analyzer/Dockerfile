FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/build /app/build

EXPOSE 80

CMD ["serve", "-s", "build", "-l", "tcp://0.0.0.0:80"]