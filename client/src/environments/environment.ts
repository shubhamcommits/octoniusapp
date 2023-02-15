// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

// DNS Details
const url = {
  protocol: `http`, // standard protocol
  domain: `localhost`, // your domain name where application is supposed to be visible
  websocket: `ws` // wss in case of https protocol, else pass ws here
}

export const environment = {

  // Environment Configs
  production: false,
  hmr: false,

  domain: url['domain'],

  //slack redirect url for authentication
  slack_redirect_url:`https://slack.com/oauth/v2/authorize`,

  // Browser Storage Key
  storageKey: `storageKey@20xx`,

  // GOOGLE properties
  GOOGLE_SCOPE: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ].join(` `),
  GOOGLE_LOGIN_SCOPE: [
    'profile',
    'email'
  ].join(` `),

  GOOGLE_OCTONIUS_CLIENT_ID: '833088201902-u8f2kkpve0tsm0qcrq4f40i65bthns9n.apps.googleusercontent.com',

  // Base Client Url
  clientUrl: `${url.protocol}://${url.domain}:4200`,

  // Octo-doc URL
  REAL_TIME_URL: `${url.domain}:3001`,

  // Authentication URLs
  AUTH_BASE_URL: `${url.protocol}://${url.domain}:3000`,
  AUTH_BASE_API_URL: `${url.protocol}://${url.domain}:3000/api`,

  // Groups URLs
  GROUPS_BASE_URL: `${url.protocol}://${url.domain}:4000`,
  GROUPS_BASE_API_URL: `${url.protocol}://${url.domain}:4000/api`,

  // Workspace URLs
  WORKSPACE_BASE_URL: `${url.protocol}://${url.domain}:5001`,
  WORKSPACE_BASE_API_URL: `${url.protocol}://${url.domain}:5001/api`,

  // Search Service URLs
  SEARCH_BASE_URL: `${url.protocol}://${url.domain}:12000`,
  SEARCH_BASE_API_URL: `${url.protocol}://${url.domain}:12000/api`,

  // User URLs
  USER_BASE_URL: `${url.protocol}://${url.domain}:7001`,
  USER_BASE_API_URL: `${url.protocol}://${url.domain}:7001/api`,

  // Slack Auth URLs
  INTEGRATIONS_BASE_API_URL: `${url.protocol}://${url.domain}:13000/api`,

  // Posts URLs
  POST_BASE_URL: `${url.protocol}://${url.domain}:8000`,
  POST_BASE_API_URL: `${url.protocol}://${url.domain}:8000/api`,

  // Notifications URLs
  NOTIFICATIONS_BASE_URL: `ws://${url.domain}:9000`,
  NOTIFICATIONS_BASE_API_URL: `${url.protocol}://${url.domain}:9000/api`,

  // Notifications URLs
  FLAMINGO_BASE_URL: `${url.protocol}://${url.domain}:14000`,
  FLAMINGO_BASE_API_URL: `${url.protocol}://${url.domain}:14000/api`,

  // Approval URLs
  APPROVAL_BASE_URL: `${url.protocol}://${url.domain}:15001`,
  APPROVAL_BASE_API_URL: `${url.protocol}://${url.domain}:15001/api`,

  // Utilities URLs
  UTILITIES_BASE_URL: `${url.protocol}://${url.domain}:10000`,
  UTILITIES_BASE_API_URL: `${url.protocol}://${url.domain}:10000/api`,
  UTILITIES_USERS_UPLOADS: `${url.protocol}://${url.domain}:10000/uploads/users`,
  UTILITIES_GROUPS_UPLOADS: `${url.protocol}://${url.domain}:10000/uploads/groups`,
  UTILITIES_FILES_UPLOADS: `${url.protocol}://${url.domain}:10000/uploads/files`,
  UTILITIES_POSTS_UPLOADS: `${url.protocol}://${url.domain}:10000/uploads/posts`,
  UTILITIES_WORKSPACES_UPLOADS: `${url.protocol}://${url.domain}:10000/uploads/workspaces`,
  UTILITIES_FLAMINGOS_UPLOADS: `${url.protocol}://${url.domain}:10000/uploads/flamingo`,
  
  LIBREOFFICE_BASE_URL: `${url.protocol}://${url.domain}:9980/`,
  LIBREOFFICE_BASE_PORT: '9980',

  // Folio URLs
  FOLIO_BASE_URL: `${url.websocket}://${url.domain}:11000`,
  FOLIO_HTTP_URL: `${url.protocol}://${url.domain}:11000`,

  // Chats URLs
  CHATS_BASE_API_URL: `${url.protocol}://${url.domain}:16001/api`,

  // MANAGEMENT_URL: 'https://management.octonius.com',
  MANAGEMENT_URL: `${url.protocol}://${url.domain}:3300`,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import `zone.js/dist/zone-error`;  // Included with Angular CLI.
