export const environment = {

  // Environment Configs
  production: true,
  hmr: false,

  // Base URLs
  BASE_API_URL: 'http://localhost:3000/api',
  BASE_URL: 'http://localhost:3000',
  // BASE_API_URL: 'https://workplace.octonius.com/api',
  // BASE_URL: 'https://workplace.octonius.com',

  // Stripe key
  pk_stripe: 'pk_live_C6kLYxOOeUXt0hzaK6PockGM',

  // Browser Storage Key
  storageKey: 'storageKey@20xx',

  // Google developer console credentials 
  developerKey: 'AIzaSyDGM66BZhGSmBApm3PKL-xCrri-3Adb06I',
  clientId: '971238950983-aef7kjl23994hjj9e8m5tch4a22b5dut.apps.googleusercontent.com',
  apiKey: 'AIzaSyDGM66BZhGSmBApm3PKL-xCrri-3Adb06I',
  clientSecret: 'erp6ZMRG6XFiMqHkjTDby2UI',
  google_redirect_url: 'https://workplace.octonius.com',
  scope: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ].join(' '),

  // Octo-doc URL
  REAL_TIME_URL: 'workplace.octonius.com/editor',

  // Mailing URLs
  MAILING_BASE_URL: 'http://localhost:2000',
  MAILING_BASE_API_URL: 'http://localhost:2000/api',

  // Authentication URLs
  AUTH_BASE_URL: 'http://localhost:3000',
  AUTH_BASE_API_URL: 'http://localhost:3000/api',

  // Groups URLs
  GROUPS_BASE_URL: 'http://localhost:4000',
  GROUPS_BASE_API_URL: 'http://localhost:4000/api',

  // Workspace URLs
  WORKSPACE_BASE_URL: 'http://localhost:5000',
  WORKSPACE_BASE_API_URL: 'http://localhost:5000/api',

  // User URLs
  USER_BASE_URL: 'http://localhost:7000',
  USER_BASE_API_URL: 'http://localhost:7000/api',

  // Posts URLs
  POST_BASE_URL: 'http://localhost:8000',
  POST_BASE_API_URL: 'http://localhost:8000/api',

  // Sockets URLs
  SOCKETS_BASE_URL: 'http://localhost:9000',
  SOCKETS_BASE_API_URL: 'http://localhost:9000/api',

  // Utilities URLs
  UTILITIES_BASE_URL: 'http://localhost:10000',
};
