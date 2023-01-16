import path from 'path';

/**
 * This function is responsible for initilising the production configuration and environment variables
 */
function prodConfigInit() {

  // Node Environment
  process.env.NODE_ENV = process.env.NODE_ENV

  // Application Port
  process.env.PORT = process.env.PORT

  // Application Host
  process.env.HOST = process.env.HOST

  // Jwt Key
  process.env.JWT_KEY = process.env.JWT_KEY

  // Database Url String
  process.env.DB_URL = process.env.DB_URL

  // Redis Environments
  process.env.REDIS_HOST = process.env.REDIS_HOST
  process.env.REDIS_PORT = process.env.REDIS_PORT

  // Files Uploads Folder
  process.env.FILE_UPLOAD_FOLDER = process.env.FILE_UPLOAD_FOLDER;

  

  // External Key
  process.env.HEADER_EXTERNAL_KEY = process.env.HEADER_EXTERNAL_KEY

  // Protocol- 'http' or 'https'
  process.env.PROTOCOL = process.env.PROTOCOL

  // Domain
  process.env.DOMAIN = process.env.DOMAIN

  // Auths Microservice
  process.env.AUTHS_SERVER = `${process.env.PROTOCOL}://${process.env.DOMAIN}/auths`
  process.env.AUTHS_SERVER_API = `${process.env.PROTOCOL}://${process.env.DOMAIN}/api/auths`

  // Groups Microservice
  process.env.GROUPS_SERVER = `${process.env.PROTOCOL}://${process.env.DOMAIN}/groups`
  process.env.GROUPS_SERVER_API = `${process.env.PROTOCOL}://${process.env.DOMAIN}/api/groups`

  // Workspaces Microservice
  process.env.WORKSPACES_SERVER = `${process.env.PROTOCOL}://${process.env.DOMAIN}/workspaces`
  process.env.WORKSPACES_SERVER_API = `${process.env.PROTOCOL}://${process.env.DOMAIN}/api/workspaces`

  // Users Microservice
  process.env.USERS_SERVER = `${process.env.PROTOCOL}://${process.env.DOMAIN}/users`
  process.env.USERS_SERVER_API = `${process.env.PROTOCOL}://${process.env.DOMAIN}/api/users`

  // Posts Microservice
  process.env.POSTS_SERVER = `${process.env.PROTOCOL}://${process.env.DOMAIN}/posts`
  process.env.POSTS_SERVER_API = `${process.env.PROTOCOL}://${process.env.DOMAIN}/api/posts`

  // Notifications Microservice
  process.env.NOTIFICATIONS_SERVER = `${process.env.PROTOCOL}://${process.env.DOMAIN}/notifications`
  process.env.NOTIFICATIONS_SERVER_API = `${process.env.PROTOCOL}://${process.env.DOMAIN}/api/notifications`

  // Utilities Microservice
  process.env.UTILITIES_SERVER = `${process.env.PROTOCOL}://${process.env.DOMAIN}/utilities`
  process.env.UTILITIES_SERVER_API = `${process.env.PROTOCOL}://${process.env.DOMAIN}/api/utilities`

  // Flamingo Microservice
  process.env.FLAMINGO_SERVER = `${process.env.PROTOCOL}://${process.env.DOMAIN}/flamingo`
  process.env.FLAMINGO_SERVER_API = `${process.env.PROTOCOL}://${process.env.DOMAIN}/api/flamingo`

  // Client Server
  process.env.CLIENT_SERVER = `${process.env.PROTOCOL}://${process.env.DOMAIN}/`

  process.env.MINIO_API_PORT = process.env.MINIO_API_PORT
  process.env.MINIO_DOMAIN = process.env.MINIO_DOMAIN
  process.env.MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY
  process.env.MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY
  process.env.MINIO_PORT = process.env.MINIO_PORT
  process.env.MINIO_PROTOCOL = process.env.MINIO_PROTOCOL
};

export { prodConfigInit as productionConfig } 
