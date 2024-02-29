// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

// DNS Details
const url = {
  protocol: `https`, // standard protocol
  domain: `v1.apps.octonius.com`, // your domain name where application is supposed to be visible
  websocket: `wss` // wss in case of https protocol, else pass ws here
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
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/admin.directory.userschema',
    'https://www.googleapis.com/auth/admin.directory.userschema.readonly',
    'https://www.googleapis.com/auth/admin.directory.user.readonly',
    'https://www.googleapis.com/auth/admin.directory.group.readonly',
    'https://www.googleapis.com/auth/admin.directory.orgunit.readonly'
  ].join(` `),
  GOOGLE_LOGIN_SCOPE: [
    'profile',
    'email'
  ].join(` `),

  GOOGLE_OCTONIUS_CLIENT_ID: '833088201902-u8f2kkpve0tsm0qcrq4f40i65bthns9n.apps.googleusercontent.com',

  // Base Client Url
  clientUrl: `${url.protocol}://${url.domain}:4200`,
  
  // Octo-doc URL
  REAL_TIME_URL: `${url["domain"]}/editor`,

  // Authentication URLs
  AUTH_BASE_URL: `${url["protocol"]}://${url["domain"]}/auths`,
  AUTH_BASE_API_URL: `${url["protocol"]}://${url["domain"]}/api/auths`,

  // Groups URLs
  GROUPS_BASE_URL: `${url["protocol"]}://${url["domain"]}/groups`,
  GROUPS_BASE_API_URL: `${url["protocol"]}://${url["domain"]}/api/groups`,

  // Workspace URLs
  WORKSPACE_BASE_URL: `${url["protocol"]}://${url["domain"]}/workspaces`,
  WORKSPACE_BASE_API_URL: `${url["protocol"]}://${url["domain"]}/api/workspaces`,

  // Search Service URLs
  SEARCH_BASE_URL: `${url["protocol"]}://${url["domain"]}/search`,
  SEARCH_BASE_API_URL: `${url["protocol"]}://${url["domain"]}/api/search`,

  // Slack Auth URLs
  INTEGRATIONS_BASE_API_URL: `${url["protocol"]}://${url["domain"]}/api/integrations`,

  // User URLs
  USER_BASE_URL: `${url["protocol"]}://${url["domain"]}/users`,
  USER_BASE_API_URL: `${url["protocol"]}://${url["domain"]}/api/users`,

  // Posts URLs
  POST_BASE_URL: `${url["protocol"]}://${url["domain"]}/posts`,
  POST_BASE_API_URL: `${url["protocol"]}://${url["domain"]}/api/posts`,

  // Notifications URLs
  FLAMINGO_BASE_URL: `${url["protocol"]}://${url["domain"]}/flamingo`,
  FLAMINGO_BASE_API_URL: `${url["protocol"]}://${url["domain"]}/api/flamingo`,

  // Notifications URLs
  NOTIFICATIONS_BASE_URL: `${url["websocket"]}://${url["domain"]}`,
  NOTIFICATIONS_BASE_API_URL: `${url["protocol"]}://${url["domain"]}/api/notifications`,

  // Approval URLs
  APPROVAL_BASE_URL: `${url["websocket"]}://${url["domain"]}`,
  APPROVAL_BASE_API_URL: `${url["protocol"]}://${url["domain"]}/api/approval`,

  // Utilities URLs
  UTILITIES_BASE_URL: `${url["protocol"]}://${url["domain"]}/utilities`,
  UTILITIES_BASE_API_URL: `${url["protocol"]}://${url["domain"]}/api/utilities`,
  UTILITIES_GROUPS_UPLOADS: `${url["protocol"]}://${url["domain"]}/uploads/groups`,
  UTILITIES_FILES_UPLOADS: `${url["protocol"]}://${url["domain"]}/uploads/files`,
  //UTILITIES_GROUP_FILES_UPLOADS: `${url["protocol"]}://${url["domain"]}/uploads/groupsFiles`,
  UTILITIES_POSTS_UPLOADS: `${url["protocol"]}://${url["domain"]}/uploads/posts`,
  UTILITIES_USERS_UPLOADS: `${url["protocol"]}://${url["domain"]}/uploads/users`,
  UTILITIES_WORKSPACES_UPLOADS: `${url["protocol"]}://${url["domain"]}/uploads/workspaces`,
  UTILITIES_FLAMINGOS_UPLOADS: `${url["protocol"]}://${url["domain"]}/uploads/flamingo`,

  //LIBREOFFICE_BASE_URL
  LIBREOFFICE_BASE_URL:  `${url["protocol"]}://${url["domain"]}/libreoffice`,

  // Folio URLs
  FOLIO_BASE_URL: `${url["websocket"]}://${url["domain"]}/folio`,
  FOLIO_HTTP_URL: `${url["protocol"]}://${url["domain"]}/folio`,

  // Chats URLs
  CHATS_BASE_URL: `${window["env"]["protocol"]}://${window["env"]["domain"]}/chats`,
  CHATS_BASE_API_URL: `${url["protocol"]}://${url["domain"]}/api/chats`,

  // MANAGEMENT_URL
  MANAGEMENT_URL: `${url["protocol"]}://${url["domain"]}`,

  STRIPE_PRICING_TABLE_ID: 'prctbl_1NUpoWGvwAwbe8mcJ6NbwIhq',
  STRIPE_PK: 'pk_live_51Op56sIlxjvoPMgbR74SNBAN3kLUrt2e37K9tRXmrHv3VyHm4FOxfIReLQc4Nlwflh5HTpfsG3EWjgF7VITNarbg002C6sXLta',
  STRIPE_INDIVIDUAL_PRODUCT_ID: 'prod_OHOYxENDSZerYK',
  STRIPE_TEAM_PRODUCT_ID: 'prod_PeOscG15Pc3olm',
  STRIPE_BUSINESS_PRODUCT_ID: 'prod_PeOw2Sy2msCwHl',
  STRIPE_ONPREMISE_PRODUCT_ID: 'prod_PePFjZ7tGQ4I2J',
};
