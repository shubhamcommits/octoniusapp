### STAGE 1: Build ###

# We label our stage as ‘builder’
FROM node:18.13 as builder

# Create app directory
WORKDIR /usr/app

# Copy package.json to the WORKDIR
COPY ./package.json ./
COPY ./yarn.lock ./

# Install dependencies
RUN yarn install

# Copy all the files from local folder to the container WORKDIR
COPY ./ ./

# Build into standard javascript modules
RUN yarn run build

RUN mv ./node_modules/ /usr/ && rm -rf *.ts && mv /usr/node_modules ./

# Expose the port
EXPOSE 9000

# Start the Server
CMD ["yarn", "run", "prod"]