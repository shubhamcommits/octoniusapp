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
  google_redirect_url: 'http://localhost:4200',
  scope: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ].join(' '),

  // Base Client Url
  clientUrl: 'http://localhost:4200',

  // Octo-doc URL
  REAL_TIME_URL: 'localhost:8080/editor',

  // Mailing URLs
  MAILING_BASE_URL: 'http://localhost:8080/mails',
  MAILING_BASE_API_URL: 'http://localhost:8080/api/mails',

  // Authentication URLs
  AUTH_BASE_URL: 'http://localhost:8080/auths',
  AUTH_BASE_API_URL: 'http://localhost:8080/api/auths',

  // Groups URLs
  GROUPS_BASE_URL: 'http://localhost:8080/groups',
  GROUPS_BASE_API_URL: 'http://localhost:8080/api/groups',

  // Workspace URLs
  WORKSPACE_BASE_URL: 'http://localhost:8080/workspaces',
  WORKSPACE_BASE_API_URL: 'http://localhost:8080/api/workspaces',

  // User URLs
  USER_BASE_URL: 'http://localhost:8080/users',
  USER_BASE_API_URL: 'http://localhost:8080/api/users',

  // Posts URLs
  POST_BASE_URL: 'http://localhost:8080/posts',
  POST_BASE_API_URL: 'http://localhost:8080/api/posts',

  // Notifications URLs
  NOTIFICATIONS_BASE_URL: 'ws://localhost:8080',
  NOTIFICATIONS_BASE_API_URL: 'http://localhost:8080/api/notifications',

  // Utilities URLs
  UTILITIES_BASE_URL: 'http://localhost:8080/utilities',
  UTILITIES_BASE_API_URL: 'http://localhost:8080/api/utilities',
  UTILITIES_GROUPS_UPLOADS: 'http://localhost:8080/uploads/groups',
  UTILITIES_POSTS_UPLOADS: 'http://localhost:8080/uploads/posts',
  UTILITIES_USERS_UPLOADS: 'http://localhost:8080/uploads/users',
  UTILITIES_WORKSPACES_UPLOADS: 'http://localhost:8080/uploads/workspaces'
};
