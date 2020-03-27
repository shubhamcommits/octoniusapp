// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {

  // Environment Configs
  production: false,
  hmr: false,

  // Base URLs
  BASE_API_URL: 'http://localhost:3000/api',
  BASE_URL: 'http://localhost:3000',

  // Stripe key
  pk_stripe: 'pk_test_rgLsr0HrrbMcqQr5G7Wz1zFK',

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

  // Octo-doc URL
  REAL_TIME_URL: 'localhost:3001',

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
  SOCKETS_BASE_URL: 'ws://localhost:9000',
  SOCKETS_BASE_API_URL: 'http://localhost:9000/api',

  // Utilities URLs
  UTILITIES_BASE_URL: 'http://localhost:10000',
};


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
