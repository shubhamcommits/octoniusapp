### STAGE 1: Build ###

# We label our stage as ‘builder’
FROM mhart/alpine-node:14.17.3 as builder

# Defining Workdir
WORKDIR /usr/app

# Copy package.json
COPY ./package.json ./

## Installing and storing node modules on a separate layer will prevent unnecessary npm installs at each build
RUN npm install

COPY ./ ./

# Move the node_modules folder and remove all the .ts files
RUN mv ./node_modules/ /usr/ && rm -rf *.ts && mv /usr/node_modules ./

## Build the angular app in production mode and store the artifacts in dist folder
RUN npm run prod



### STAGE 2: Setup ###

FROM nginx:alpine

## Copy our default nginx config
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## From ‘builder’ stage copy over the artifacts in dist folder to default nginx public folder
COPY --from=builder /usr/app/dist /usr/share/nginx/html
#COPY --from=builder /usr/app/dist/en /usr/share/nginx/html

# Exposing the builded application on port 80
EXPOSE 80

# When the container starts, replace the env.js with values from environment variables
CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/en/assets/env.template.js > /usr/share/nginx/html/en/assets/env.js && envsubst < /usr/share/nginx/html/de/assets/env.template.js > /usr/share/nginx/html/de/assets/env.js && envsubst < /usr/share/nginx/html/es/assets/env.template.js > /usr/share/nginx/html/es/assets/env.js && envsubst < /usr/share/nginx/html/fa/assets/env.template.js > /usr/share/nginx/html/fa/assets/env.js && exec nginx -g 'daemon off;'"]
