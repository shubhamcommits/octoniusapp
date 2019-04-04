FROM node:alpine as builder

WORKDIR '/app'
COPY ./package.json ./package-lock.json ./
RUN apk add --no-cache --virtual .gyp python make g++
RUN npm config set unsafe-perm true
RUN npm install --global node-gyp \
    && npm config set python python2.7 \
    && npm install -g @angular/cli \
    && npm install
RUN apk del .gyp
COPY ./ ./
RUN ng build --prod

FROM nginx

COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 4200
CMD ["nginx", "-g", "daemon off;"]
