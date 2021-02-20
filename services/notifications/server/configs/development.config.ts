import path from 'path';

/**
 * This function is responsible for initilising the development configuration and environment variables
 */
function devConfigInit() {

  // Node Environment
  process.env.NODE_ENV = process.env.NODE_ENV || 'development'

  // Application Port
  process.env.PORT = process.env.PORT || '9000'

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
  process.env.FILE_UPLOAD_FOLDER = process.env.FILE_UPLOAD_FOLDER || path.join(__dirname, '../uploads/');

  // Sendgrid Key
  process.env.SENDGRID_KEY = process.env.SENDGRID_KEY || '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'

  // Stripe Keys
  process.env.SK_STRIPE = process.env.SK_STRIPE || 'sk_test_dvebbZQPA4Vk8kKZaEuN32sD';
  process.env.STRIPE_PLAN = process.env.STRIPE_PLAN || 'plan_EK1uRUJLJcDS6e';
  process.env.WEBHOOK_PS_SECRET = process.env.WEBHOOK_PS_SECRET || 'whsec_pmcLdxoYxBAdZswT2ZzWYep2WmnBW8Sn';

  // External Key
  process.env.HEADER_EXTERNAL_KEY = process.env.HEADER_EXTERNAL_KEY || 'HEADERIDSHAREDFOROCTONIUS'

  // Protocol- 'http' or 'https'
  process.env.PROTOCOL = process.env.PROTOCOL || 'http'

  // Domain
  process.env.DOMAIN = process.env.DOMAIN || 'localhost'

  // Mailing Mircoservice
  process.env.MAILING_PORT = process.env.MAILING_PORT || '2000'
  process.env.MAILING_SERVER = `${process.env.PROTOCOL}://${process.env.DOMAIN}:${process.env.MAILING_PORT}`
  process.env.MAILING_SERVER_API = `${process.env.PROTOCOL}://${process.env.DOMAIN}${process.env.MAILING_PORT}/api`

  // Auths Microservice
  process.env.AUTHS_PORT = process.env.AUTHS_PORT || '3000'
  process.env.AUTHS_SERVER = `${process.env.PROTOCOL}://${process.env.DOMAIN}:${process.env.AUTHS_PORT}`
  process.env.AUTHS_SERVER_API = `${process.env.PROTOCOL}://${process.env.DOMAIN}/api`

  // Groups Microservice
  process.env.GROUPS_PORT = process.env.GROUPS || '4000'
  process.env.GROUPS_SERVER = `${process.env.PROTOCOL}://${process.env.DOMAIN}:${process.env.GROUPS_PORT}`
  process.env.GROUPS_SERVER_API = `${process.env.PROTOCOL}://${process.env.DOMAIN}:${process.env.GROUPS_PORT}/api`

  // Workspaces Microservice
  process.env.WORKSPACES_PORT = process.env.WORKSPACES_PORT || '5000'
  process.env.WORKSPACES_SERVER = `${process.env.PROTOCOL}://${process.env.DOMAIN}:${process.env.WORKSPACES_PORT}`
  process.env.WORKSPACES_SERVER_API = `${process.env.PROTOCOL}://${process.env.DOMAIN}:${process.env.WORKSPACES_PORT}/api`

  // Search Microservice
  process.env.SEARCH_PORT = process.env.SEARCH_PORT || '12000'
  process.env.SEARCH_SERVER = `${process.env.PROTOCOL}://${process.env.DOMAIN}:${process.env.SEARCH_PORT}`
  process.env.SEARCH_SERVER_API = `${process.env.PROTOCOL}://${process.env.DOMAIN}:${process.env.SEARCH_PORT}/api/search-service`

  // Users Microservice
  process.env.USERS_PORT = process.env.USERS_PORT || '7000'
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
  
  // Integrations Microservice
  process.env.INTEGRATION_PORT = process.env.INTEGRATION_PORT || '13000'
  process.env.INTEGRATION_SERVER =  `${process.env.PROTOCOL}://${process.env.DOMAIN}:${process.env.INTEGRATION_PORT}`
  process.env.INTEGRATION_SERVER_API = `${process.env.PROTOCOL}://${process.env.DOMAIN}:${process.env.INTEGRATION_PORT}/api`
};

export { devConfigInit as developmentConfig }

