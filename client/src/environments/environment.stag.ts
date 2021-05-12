export const environment = {

  // Environment Configs
  production: true,
  hmr: false,

  // Stripe key
  pk_stripe: 'pk_live_C6kLYxOOeUXt0hzaK6PockGM',
  product_stripe: `prod_HxaOA05Qf9iwpV`,

  //slack redirect url for authentication
  slack_redirect_url:`https://slack.com/oauth/v2/authorize?client_id=2561616476.1793890184164&scope=commands,incoming-webhook`,

  // Browser Storage Key
  storageKey: 'storageKey@20xx',

  // Google developer console credentials
  developerKey: 'AIzaSyDGM66BZhGSmBApm3PKL-xCrri-3Adb06I',
  clientId: '971238950983-aef7kjl23994hjj9e8m5tch4a22b5dut.apps.googleusercontent.com',
  apiKey: 'AIzaSyDGM66BZhGSmBApm3PKL-xCrri-3Adb06I',
  clientSecret: 'erp6ZMRG6XFiMqHkjTDby2UI',
  google_redirect_url: 'http://localhost:4200',
  scope: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ].join(' '),

  // Base Client Url
  clientUrl: 'http://localhost:4200',

  // Octo-doc URL
  REAL_TIME_URL: 'localhost:80/editor',

  // Mailing URLs
  MAILING_BASE_URL: 'http://localhost:80/mails',
  MAILING_BASE_API_URL: 'http://localhost:80/api/mails',

  // Authentication URLs
  AUTH_BASE_URL: 'http://localhost:80/auths',
  AUTH_BASE_API_URL: 'http://localhost:80/api/auths',

  // Groups URLs
  GROUPS_BASE_URL: 'http://localhost:80/groups',
  GROUPS_BASE_API_URL: 'http://localhost:80/api/groups',

  // Workspace URLs
  WORKSPACE_BASE_URL: 'http://localhost:80/workspaces',
  WORKSPACE_BASE_API_URL: 'http://localhost:80/api/workspaces',

  // Slack Auth URLs
  INTEGRATIONS_BASE_API_URL: `http://localhost:80/api/integrations`,

  // User URLs
  USER_BASE_URL: 'http://localhost:80/users',
  USER_BASE_API_URL: 'http://localhost:80/api/users',

  // Posts URLs
  POST_BASE_URL: 'http://localhost:80/posts',
  POST_BASE_API_URL: 'http://localhost:80/api/posts',

  // Notifications URLs
  FLAMINGO_BASE_URL: 'http://localhost:80/flamingo',
  FLAMINGO_BASE_API_URL: 'http://localhost:80/api/flamingo',

  // Notifications URLs
  NOTIFICATIONS_BASE_URL: 'ws://localhost:80',
  NOTIFICATIONS_BASE_API_URL: 'http://localhost:80/api/notifications',

  // Utilities URLs
  UTILITIES_BASE_URL: 'http://localhost:80/utilities',
  UTILITIES_BASE_API_URL: 'http://localhost:80/api/utilities',
  UTILITIES_GROUPS_UPLOADS: 'http://localhost:80/uploads/groups',
  UTILITIES_POSTS_UPLOADS: 'http://localhost:80/uploads/posts',
  UTILITIES_USERS_UPLOADS: 'http://localhost:80/uploads/users',
  UTILITIES_WORKSPACES_UPLOADS: 'http://localhost:80/uploads/workspaces',
  UTILITIES_FLAMINGOS_UPLOADS: 'http://localhost:80/uploads/flamingo',

  MANAGEMENT_URL: 'https://management.octonius.com',
  MANAGEMENT_API_KEY: 'TZCDAC3CDCJILSRGA2II'
};
