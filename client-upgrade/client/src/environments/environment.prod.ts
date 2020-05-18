export const environment = {

  // Environment Configs
  production: true,
  hmr: false,

  // Stripe key
  pk_stripe: 'pk_live_C6kLYxOOeUXt0hzaK6PockGM',

  // Browser Storage Key
  storageKey: 'storageKey@20xx',

  // Google developer console credentials 
  developerKey: 'AIzaSyDGM66BZhGSmBApm3PKL-xCrri-3Adb06I',
  clientId: '971238950983-aef7kjl23994hjj9e8m5tch4a22b5dut.apps.googleusercontent.com',
  apiKey: 'AIzaSyDGM66BZhGSmBApm3PKL-xCrri-3Adb06I',
  clientSecret: 'erp6ZMRG6XFiMqHkjTDby2UI',
  google_redirect_url: 'https://flash.octonius.com',
  scope: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ].join(' '),

  // Base Client Url
  clientUrl: 'https://flash.octonius.com',

  // Octo-doc URL
  REAL_TIME_URL: 'flash.octonius.com/editor',

  // Mailing URLs
  MAILING_BASE_URL: 'https://flash.octonius.com/mails',
  MAILING_BASE_API_URL: 'https://flash.octonius.com/api/mails',

  // Authentication URLs
  AUTH_BASE_URL: 'https://flash.octonius.com/auths',
  AUTH_BASE_API_URL: 'https://flash.octonius.com/api/auths',

  // Groups URLs
  GROUPS_BASE_URL: 'https://flash.octonius.com/groups',
  GROUPS_BASE_API_URL: 'https://flash.octonius.com/api/groups',

  // Workspace URLs
  WORKSPACE_BASE_URL: 'https://flash.octonius.com/workspaces',
  WORKSPACE_BASE_API_URL: 'https://flash.octonius.com/api/workspaces',

  // User URLs
  USER_BASE_URL: 'https://flash.octonius.com/users',
  USER_BASE_API_URL: 'https://flash.octonius.com/api/users',

  // Posts URLs
  POST_BASE_URL: 'https://flash.octonius.com/posts',
  POST_BASE_API_URL: 'https://flash.octonius.com/api/posts',

  // Notifications URLs
  NOTIFICATIONS_BASE_URL: 'wss://flash.octonius.com',
  NOTIFICATIONS_BASE_API_URL: 'https://flash.octonius.com/api/notifications',

  // Query Service URLs
  QUERY_SERVICE_BASE_URL: 'https://flash.octonius.com/query',
  QUERY_SERVICE_BASE_API_URL: 'https://flash.octonius.com/api/query',
  QUERY_SERVICE_MONITOR_URL: 'https://flash.octonius.com/monitor/solr',

  // Utilities URLs
  UTILITIES_BASE_URL: 'https://flash.octonius.com/utilities',
  UTILITIES_BASE_API_URL: 'https://flash.octonius.com/api/utilities',
  UTILITIES_GROUPS_UPLOADS: 'https://flash.octonius.com/uploads/groups',
  UTILITIES_FILES_UPLOADS: 'https://flash.octonius.com/uploads/files',
  UTILITIES_POSTS_UPLOADS: 'https://flash.octonius.com/uploads/posts',
  UTILITIES_USERS_UPLOADS: 'https://flash.octonius.com/uploads/users',
  UTILITIES_WORKSPACES_UPLOADS: 'https://flash.octonius.com/uploads/workspaces'
};
