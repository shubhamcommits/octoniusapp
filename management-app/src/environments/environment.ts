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

  // Browser Storage Key
  storageKey: `storageKey@20xx`,

  // Google developer console credentials
  developerKey: `AIzaSyDGM66BZhGSmBApm3PKL-xCrri-3Adb06I`,
  clientId: `971238950983-aef7kjl23994hjj9e8m5tch4a22b5dut.apps.googleusercontent.com`,
  apiKey: `AIzaSyDGM66BZhGSmBApm3PKL-xCrri-3Adb06I`,
  clientSecret: `erp6ZMRG6XFiMqHkjTDby2UI`,
  google_redirect_url: `${url.protocol}://${url.domain}:4200`,
  scope: [
    `https://www.googleapis.com/auth/drive`,
    `https://www.googleapis.com/auth/calendar`,
    `https://www.googleapis.com/auth/calendar.events`
  ].join(` `),

  // Base Client Url
  clientUrl: `${url.protocol}://${url.domain}:4200`,

  // Management App Url
  mgmtUrl: `${url.protocol}://${url.domain}:5200`,

  // Authentication URLs
  AUTH_BASE_URL: `${url.protocol}://${url.domain}:3000`,
  AUTH_BASE_API_URL: `${url.protocol}://${url.domain}:3000/api`,

  // Groups URLs
  GROUPS_BASE_URL: `${url.protocol}://${url.domain}:4000`,
  GROUPS_BASE_API_URL: `${url.protocol}://${url.domain}:4000/api`,

  // Workspace URLs
  WORKSPACE_BASE_URL: `${url.protocol}://${url.domain}:5000`,
  WORKSPACE_BASE_API_URL: `${url.protocol}://${url.domain}:5000/api`,

  // Search Service URLs
  SEARCH_BASE_URL: `${url.protocol}://${url.domain}:12000`,
  SEARCH_BASE_API_URL: `${url.protocol}://${url.domain}:12000/api`,

  // User URLs
  USER_BASE_URL: `${url.protocol}://${url.domain}:7000`,
  USER_BASE_API_URL: `${url.protocol}://${url.domain}:7000/api`,

  // Posts URLs
  POST_BASE_URL: `${url.protocol}://${url.domain}:8000`,
  POST_BASE_API_URL: `${url.protocol}://${url.domain}:8000/api`,

  // Notifications URLs
  NOTIFICATIONS_BASE_URL: `ws://${url.domain}:9000`,
  NOTIFICATIONS_BASE_API_URL: `${url.protocol}://${url.domain}:9000/api`,

  // Utilities URLs
  UTILITIES_BASE_URL: `${url.protocol}://${url.domain}:10000`,
  UTILITIES_BASE_API_URL: `${url.protocol}://${url.domain}:10000/api`,
  UTILITIES_GROUPS_UPLOADS: `${url.protocol}://${url.domain}:10000/uploads/groups`,
  UTILITIES_FILES_UPLOADS: `${url.protocol}://${url.domain}:10000/uploads/files`,
  UTILITIES_POSTS_UPLOADS: `${url.protocol}://${url.domain}:10000/uploads/posts`,
  UTILITIES_USERS_UPLOADS: `${url.protocol}://${url.domain}:10000/uploads/users`,
  UTILITIES_WORKSPACES_UPLOADS: `${url.protocol}://${url.domain}:10000/uploads/workspaces`,
};
