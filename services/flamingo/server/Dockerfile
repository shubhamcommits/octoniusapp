### STAGE 1: Build ###

# We label our stage as ‘builder’
FROM node:14.21 as builder

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

RUN mv ./node_modules/ /usr/ && rm -rf *.ts && mv /usr/node_modules ./

# Expose the port
EXPOSE 14000

# Start the Server
CMD ["yarn", "run", "prod"]