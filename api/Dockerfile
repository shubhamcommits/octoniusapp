FROM node:11.10

WORKDIR '/app'
COPY ./package.json ./
# RUN apk --no-cache add --virtual builds-deps build-base python
RUN yarn install
COPY ./ ./
CMD ["yarn", "start"]
