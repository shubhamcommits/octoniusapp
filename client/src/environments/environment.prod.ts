// DNS Details
const url = {
  protocol: `https`, // standard protocol
  domain: `app.octonius.com`, // your domain name where application is supposed to be visible
  websocket: `wss` // wss in case of https protocol, else pass ws here
}

// Export Environment variables
export const environment = {

  // Environment Configs
  production: true,
  hmr: false,

  // Stripe key
  pk_stripe: `pk_live_C6kLYxOOeUXt0hzaK6PockGM`,
  product_stripe: `prod_HxaOA05Qf9iwpV`,

  // Browser Storage Key
  storageKey: `storageKey@20xx`,

  // Google developer console credentials
  developerKey: `AIzaSyDGM66BZhGSmBApm3PKL-xCrri-3Adb06I`,
  clientId: `971238950983-aef7kjl23994hjj9e8m5tch4a22b5dut.apps.googleusercontent.com`,
  apiKey: `AIzaSyDGM66BZhGSmBApm3PKL-xCrri-3Adb06I`,
  clientSecret: `erp6ZMRG6XFiMqHkjTDby2UI`,
  google_redirect_url: `${url.protocol}://${url.domain}`,
  scope: [
    `https://www.googleapis.com/auth/drive`,
    `https://www.googleapis.com/auth/calendar`
  ].join(` `),

  // Base Client Url
  clientUrl: `${url.protocol}://${url.domain}`,

  // Octo-doc URL
  REAL_TIME_URL: `${url.domain}/editor`,

  // Mailing URLs
  MAILING_BASE_URL: `${url.protocol}://${url.domain}/mails`,
  MAILING_BASE_API_URL: `${url.protocol}://${url.domain}/api/mails`,

  // Authentication URLs
  AUTH_BASE_URL: `${url.protocol}://${url.domain}/auths`,
  AUTH_BASE_API_URL: `${url.protocol}://${url.domain}/api/auths`,

  // Groups URLs
  GROUPS_BASE_URL: `${url.protocol}://${url.domain}/groups`,
  GROUPS_BASE_API_URL: `${url.protocol}://${url.domain}/api/groups`,

  // Workspace URLs
  WORKSPACE_BASE_URL: `${url.protocol}://${url.domain}/workspaces`,
  WORKSPACE_BASE_API_URL: `${url.protocol}://${url.domain}/api/workspaces`,

  // Search Service URLs
  SEARCH_BASE_URL: `${url.protocol}://${url.domain}/search`,
  SEARCH_BASE_API_URL: `${url.protocol}://${url.domain}/api/search`,

  // Slack Auth URLs
  SLACK_BASE_API_URL: `${url.protocol}://${url.domain}/api/integrations`,

  // User URLs
  USER_BASE_URL: `${url.protocol}://${url.domain}/users`,
  USER_BASE_API_URL: `${url.protocol}://${url.domain}/api/users`,

  // Posts URLs
  POST_BASE_URL: `${url.protocol}://${url.domain}/posts`,
  POST_BASE_API_URL: `${url.protocol}://${url.domain}/api/posts`,

  // Notifications URLs
  NOTIFICATIONS_BASE_URL: `${url.websocket}://${url.domain}`,
  NOTIFICATIONS_BASE_API_URL: `${url.protocol}://${url.domain}/api/notifications`,

  // Utilities URLs
  UTILITIES_BASE_URL: `${url.protocol}://${url.domain}/utilities`,
  UTILITIES_BASE_API_URL: `${url.protocol}://${url.domain}/api/utilities`,
  UTILITIES_GROUPS_UPLOADS: `${url.protocol}://${url.domain}/uploads/groups`,
  UTILITIES_FILES_UPLOADS: `${url.protocol}://${url.domain}/uploads/files`,
  UTILITIES_POSTS_UPLOADS: `${url.protocol}://${url.domain}/uploads/posts`,
  UTILITIES_USERS_UPLOADS: `${url.protocol}://${url.domain}/uploads/users`,
  UTILITIES_WORKSPACES_UPLOADS: `${url.protocol}://${url.domain}/uploads/workspaces`,

  // Folio URLs
  FOLIO_BASE_URL: `${url.websocket}://${url.domain}/folio`
};
