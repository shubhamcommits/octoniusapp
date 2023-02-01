import path from 'path';

/**
 * This function is responsible for initilising the development configuration and environment variables
 */
function devConfigInit() {

  // Node Environment
  process.env.NODE_ENV = process.env.NODE_ENV || 'development'

  // Application Port
  process.env.PORT = process.env.PORT || '4000'

  // Application Host
  process.env.HOST = process.env.HOST || '0.0.0.0'

  // Jwt Key
  process.env.JWT_KEY = process.env.JWT_KEY || 'asfsaf12safas23fsafa12sf'

  // Database Url String
  process.env.DB_URL = process.env.DB_URL || 'mongodb://127.0.0.1:27017/octonius'

  // Redis Environments
  process.env.REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1'
  process.env.REDIS_PORT = process.env.REDIS_PORT || '6379'

  // Files Uploads Folder
  process.env.FILE_UPLOAD_FOLDER = process.env.FILE_UPLOAD_FOLDER || '/';

  // External Key
  process.env.HEADER_EXTERNAL_KEY = process.env.HEADER_EXTERNAL_KEY || 'HEADERIDSHAREDFOROCTONIUS'

  // Protocol- 'http' or 'https'
  process.env.PROTOCOL = process.env.PROTOCOL || 'http'

  // Domain
  process.env.DOMAIN = process.env.DOMAIN || 'localhost'

  // Auths Microservice
  process.env.AUTHS_PORT = process.env.AUTHS_PORT || '3000'
  process.env.AUTHS_SERVER = `${process.env.PROTOCOL}://${process.env.DOMAIN}:${process.env.AUTHS_PORT}`
  process.env.AUTHS_SERVER_API = `${process.env.PROTOCOL}://${process.env.DOMAIN}/api`

  // Groups Microservice
  process.env.GROUPS_PORT = process.env.GROUPS || '4000'
  process.env.GROUPS_SERVER = `${process.env.PROTOCOL}://${process.env.DOMAIN}:${process.env.GROUPS_PORT}`
  process.env.GROUPS_SERVER_API = `${process.env.PROTOCOL}://${process.env.DOMAIN}:${process.env.GROUPS_PORT}/api`

  // Workspaces Microservice
  process.env.WORKSPACES_PORT = process.env.WORKSPACES_PORT || '5001'
  process.env.WORKSPACES_SERVER = `${process.env.PROTOCOL}://${process.env.DOMAIN}:${process.env.WORKSPACES_PORT}`
  process.env.WORKSPACES_SERVER_API = `${process.env.PROTOCOL}://${process.env.DOMAIN}:${process.env.WORKSPACES_PORT}/api`

  // Search Microservice
  process.env.SEARCH_PORT = process.env.SEARCH_PORT || '12000'
  process.env.SEARCH_SERVER = `${process.env.PROTOCOL}://${process.env.DOMAIN}:${process.env.SEARCH_PORT}`
  process.env.SEARCH_SERVER_API = `${process.env.PROTOCOL}://${process.env.DOMAIN}:${process.env.SEARCH_PORT}/api/search-service`

  // Users Microservice
  process.env.USERS_PORT = process.env.USERS_PORT || '7001'
  process.env.USERS_SERVER = `${process.env.PROTOCOL}://${process.env.DOMAIN}:${process.env.USERS_PORT}`
  process.env.USERS_SERVER_API = `${process.env.PROTOCOL}://${process.env.DOMAIN}:${process.env.USERS_PORT}/api`

  // Posts Microservice
  process.env.POSTS_PORT = process.env.POSTS_PORT || '8000'
  process.env.POSTS_SERVER = `${process.env.PROTOCOL}://${process.env.DOMAIN}:${process.env.POSTS_PORT}`
  process.env.POSTS_SERVER_API = `${process.env.PROTOCOL}://${process.env.DOMAIN}:${process.env.POSTS_PORT}/api`

  // Notifications Microservice
  process.env.NOTIFICATIONS_PORT = process.env.NOTIFICATIONS_PORT || '9000'
  process.env.NOTIFICATIONS_SERVER = `${process.env.PROTOCOL}://${process.env.DOMAIN}:${process.env.NOTIFICATIONS_PORT}`
  process.env.NOTIFICATIONS_SERVER_API = `${process.env.PROTOCOL}://${process.env.DOMAIN}:${process.env.NOTIFICATIONS_PORT}/api`

  // Utilities Microservice
  process.env.UTILITIES_PORT = process.env.UTILITIES_PORT || '10000'
  process.env.UTILITIES_SERVER = `${process.env.PROTOCOL}://${process.env.DOMAIN}:${process.env.UTILITIES_PORT}`
  process.env.UTILITIES_SERVER_API = `${process.env.PROTOCOL}://${process.env.DOMAIN}:${process.env.UTILITIES_PORT}/api`

  // Flamingo Microservice
  process.env.FLAMINGO_PORT = process.env.FLAMINGO_PORT || '14000'
  process.env.FLAMINGO_SERVER = `${process.env.PROTOCOL}://${process.env.DOMAIN}:${process.env.FLAMINGO_PORT}`
  process.env.FLAMINGO_SERVER_API = `${process.env.PROTOCOL}://${process.env.DOMAIN}:${process.env.FLAMINGO_PORT}/api`

  // MANAGEMENT PORTAL API
  process.env.MANAGEMENT_URL = 'http://localhost:3300'

  // Proxy Available
  process.env.PROXY_AVAILABLE = process.env.PROXY_AVAILABLE || 'false'

  // Proxy Protocol
  process.env.PROXY_PROTOCOL = process.env.PROXY_PROTOCOL

  // Proxy Host
  process.env.PROXY_HOST = process.env.PROXY_HOST

  // Proxy Port
  process.env.PROXY_PORT = process.env.PROXY_PORT

  process.env.MINIO_API_PORT = process.env.MINIO_API_PORT || '19000'
  process.env.MINIO_DOMAIN = process.env.MINIO_DOMAIN || process.env.DOMAIN
  process.env.MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || '7UbsSPpbmzERsFFN'
  process.env.MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || '0IOHSeS1tULlsRks3CUYIohIXHCOQaNg'
  process.env.MINIO_PORT = process.env.MINIO_PORT || '9090'
  process.env.MINIO_PROTOCOL = process.env.MINIO_PROTOCOL || 'http'
};

export { devConfigInit as developmentConfig }

