### STAGE 1: Build ###

# We label our stage as ‘builder’
# FROM node:10-alpine as builder
FROM mhart/alpine-node:14 as builder

# Create app directory
WORKDIR /usr/app

# Copy package.json to the WORKDIR
COPY ./package.json ./

# Install dependencies
RUN yarn install

# Copy all the files from local folder to the container WORKDIR
COPY ./ ./

# Build into standard javascript modules
RUN yarn run build

# Move the node_modules folder and remove all the .ts files
RUN mv ./node_modules/ /usr/ && rm -rf *.ts && mv /usr/node_modules ./

# Expose the port
EXPOSE 3000

# Start the Server
CMD ["yarn", "run", "prod"]