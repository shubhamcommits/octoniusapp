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
  process.env.FILE_UPLOAD_FOLDER = process.env.FILE_UPLOAD_FOLDER || path.join(__dirname, '../uploads/');

  // Sendgrid Key
  process.env.SENDGRID_KEY = process.env.SENDGRID_KEY

  // External Key
  process.env.HEADER_EXTERNAL_KEY = process.env.HEADER_EXTERNAL_KEY

  // Protocol- 'http' or 'https'
  process.env.PROTOCOL = process.env.PROTOCOL

  // Domain
  process.env.DOMAIN = process.env.DOMAIN

  // Mailing Mircoservice
  process.env.MAILING_SERVER = `${process.env.PROTOCOL}://${process.env.DOMAIN}/mails`
  process.env.MAILING_SERVER_API = `${process.env.PROTOCOL}://${process.env.DOMAIN}/api/mails`

  // Auths Microservice
  process.env.AUTHS_SERVER = `${process.env.PROTOCOL}://${process.env.DOMAIN}/auths`
  process.env.AUTHS_SERVER_API = `${process.env.PROTOCOL}://${process.env.DOMAIN}/api/auths`

  // Groups Microservice
  process.env.GROUPS_SERVER = `${process.env.PROTOCOL}://${process.env.DOMAIN}/groups`
  process.env.GROUPS_SERVER_API = `${process.env.PROTOCOL}://${process.env.DOMAIN}/api/groups`

  // Workspaces Microservice
  process.env.WORKSPACES_SERVER = `${process.env.PROTOCOL}://${process.env.DOMAIN}/workspaces`
  process.env.WORKSPACES_SERVER_API = `${process.env.PROTOCOL}://${process.env.DOMAIN}/api/workspaces`

  // Search Microservice
  process.env.SEARCH_SERVER = `${process.env.PROTOCOL}://${process.env.DOMAIN}/search`
  process.env.SEARCH_SERVER_API = `${process.env.PROTOCOL}://${process.env.DOMAIN}/api/search`

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

  // Management URL
  process.env.MANAGEMENT_URL = process.env.MANAGEMENT_URL 

  // Proxy Available
  process.env.PROXY_AVAILABLE = process.env.PROXY_AVAILABLE

  // Proxy Protocol
  process.env.PROXY_PROTOCOL = process.env.PROXY_PROTOCOL

  // Proxy Host
  process.env.PROXY_HOST = process.env.PROXY_HOST

  // Proxy Port
  process.env.PROXY_PORT = process.env.PROXY_PORT
};

export { prodConfigInit as productionConfig } 
