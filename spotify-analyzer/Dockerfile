FROM node:23 AS build

ARG REACT_APP_ENV=production

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

COPY .env.${REACT_APP_ENV} .env

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
