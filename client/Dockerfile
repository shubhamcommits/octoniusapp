### STAGE 1: Build ###

# We label our stage as ‘builder’
FROM mhart/alpine-node:12 as builder

# Defining Workdir
WORKDIR /usr/app

# Copy package.json
COPY ./package.json ./

## Installing and storing node modules on a separate layer will prevent unnecessary npm installs at each build
RUN yarn install

COPY ./ ./

# Move the node_modules folder and remove all the .ts files
RUN mv ./node_modules/ /usr/ && rm -rf *.ts && mv /usr/node_modules ./

## Build the angular app in production mode and store the artifacts in dist folder
RUN yarn run prod



### STAGE 2: Setup ###

FROM nginx:alpine

## Copy our default nginx config
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## From ‘builder’ stage copy over the artifacts in dist folder to default nginx public folder
COPY --from=builder /usr/app/dist /usr/share/nginx/html

# Exposing the builded application on port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
