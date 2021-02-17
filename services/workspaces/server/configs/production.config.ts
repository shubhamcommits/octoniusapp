import path from 'path';

/**
 * This function is responsible for initilising the production configuration and environment variables
 */
function prodConfigInit() {

  // Node Environment
  process.env.NODE_ENV = process.env.NODE_ENV || 'production'

  // Application Port
  process.env.PORT = process.env.PORT ||'5000'

  // Application Host
  process.env.HOST = process.env.HOST ||'0.0.0.0'

  // Jwt Key
  process.env.JWT_KEY = process.env.JWT_KEY ||'asfsaf12safas23fsafa12sf'

  // Database Url String
  process.env.dbURL = process.env.dbURL || 'mongodb://mongodb:27017/octonius' || 'mongodb://127.0.0.1:27017/octonius'

  // Redis Environments
  process.env.REDIS_HOST = process.env.REDIS_HOST ||'redis'
  process.env.REDIS_PORT = process.env.REDIS_PORT ||'6379'

  // Files Uploads Folder
  process.env.FILE_UPLOAD_FOLDER = process.env.FILE_UPLOAD_FOLDER || path.join(__dirname, '../uploads/');

  // Sendgrid Key
  process.env.SENDGRID_KEY = process.env.SENDGRID_KEY || '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'

  // Stripe Keys
  process.env.SK_STRIPE = process.env.SK_STRIPE || 'sk_live_WupyMoQf93S59gwTqmYpmWel'
  process.env.stripe_plan = process.env.stripe_plan || 'plan_EK1rDLfKr9NRkU'
  process.env.WEBHOOK_PS_SECRET = process.env.WEBHOOK_PS_SECRET ||'whsec_pmcLdxoYxBAdZswT2ZzWYep2WmnBW8Sn'

  // External Key
  process.env.HEADER_EXTERNAL_KEY = process.env.HEADER_EXTERNAL_KEY || 'HEADERIDSHAREDFOROCTONIUS'

  // Protocol- 'http' or 'https'
  process.env.PROTOCOL = process.env.PROTOCOL ||'http'

  // Domain
  process.env.DOMAIN = process.env.DOMAIN ||'localhost'

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

  process.env.MANAGEMENT_URL = 'https://management.octonius.com'
  process.env.MANAGEMENT_API_KEY = "TZCDAC3CDCJILSRGA2II"
};

export { prodConfigInit as productionConfig } 
