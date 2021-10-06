### STAGE 1: Build ###

# We label our stage as ‘builder’
FROM mhart/alpine-node:14 as builder

# Create app directory
WORKDIR /usr/app

RUN apk update

RUN apk --no-cache --update upgrade && apk --no-cache add libreoffice

RUN apk --update add openjdk7-jre

RUN mkdir Trash

# Copy package.json to the WORKDIR
COPY ./package.json ./

# Install dependencies
RUN npm install

# Copy all the files from local folder to the container WORKDIR
COPY ./ ./

# Expose the port
EXPOSE 11200

# Start the Server
CMD ["npm", "run", "dev"]