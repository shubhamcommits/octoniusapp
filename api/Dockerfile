# We label our stage as ‘builder’
FROM node:alpine as builder

# Create app directory
WORKDIR /app

# Copy package.json to the WORKDIR
COPY ./package.json ./

# Install dependencies
RUN yarn

# Download and Install Pandoc in the Environment
RUN wget https://github.com/jgm/pandoc/releases/download/2.7.3/pandoc-2.7.3-1-amd64.deb
RUN dpkg -i /app/pandoc-2.7.3-1-amd64.deb

# Copy all the files from local folder to the container WORKDIR
COPY ./ ./

# Remove the Downloaded file
RUN rm /app/pandoc-2.7.3-1-amd64.deb

# Expose the port
EXPOSE 3000

# Start the Server
CMD ["yarn", "start"]
