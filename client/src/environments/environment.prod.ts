// DNS Details
const url = {
  protocol: window["env"]["protocol"], // standard protocol
  domain: window["env"]["domain"], // your domain name where application is supposed to be visible
  websocket: window["env"]["websocket"],  // wss in case of https protocol, else pass ws here
  mgmt_portal_domain: window["env"]["mgmt_portal_domain"]
}

// Export Environment variables
export const environment = {

  // Environment Configs
  production: true,
  hmr: false,

  domain: url['domain'],

  // Browser Storage Key
  storageKey: `storageKey@20xx`,

  //SLACK Properties
  SLACK_CLIENT_ID: window["env"]["SLACK_CLIENT_ID"],

  // Google developer console credentials
  SSO_GOOGLE_METHOD: window["env"]["SSO_GOOGLE_METHOD"],
  GOOGLE_CLIENT_ID: window["env"]["GOOGLE_CLIENT_ID"],
  GOOGLE_CLIENT_SECRET: window["env"]["GOOGLE_CLIENT_SECRET"],
  GOOGLE_REDIRECT_URL: `${window["env"]["protocol"]}://${window["env"]["domain"]}`,
  GOOGLE_SCOPE: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ].join(` `),

  // Base Client Url
  clientUrl: `${window["env"]["protocol"]}://${window["env"]["domain"]}`,

  // Octo-doc URL
  REAL_TIME_URL: `${window["env"]["domain"]}/editor`,

  // Authentication URLs
  AUTH_BASE_URL: `${window["env"]["protocol"]}://${window["env"]["domain"]}/auths`,
  AUTH_BASE_API_URL: `${window["env"]["protocol"]}://${window["env"]["domain"]}/api/auths`,

  // Groups URLs
  GROUPS_BASE_URL: `${window["env"]["protocol"]}://${window["env"]["domain"]}/groups`,
  GROUPS_BASE_API_URL: `${window["env"]["protocol"]}://${window["env"]["domain"]}/api/groups`,

  // Workspace URLs
  WORKSPACE_BASE_URL: `${window["env"]["protocol"]}://${window["env"]["domain"]}/workspaces`,
  WORKSPACE_BASE_API_URL: `${window["env"]["protocol"]}://${window["env"]["domain"]}/api/workspaces`,

  // Search Service URLs
  SEARCH_BASE_URL: `${window["env"]["protocol"]}://${window["env"]["domain"]}/search`,
  SEARCH_BASE_API_URL: `${window["env"]["protocol"]}://${window["env"]["domain"]}/api/search`,

  // Slack Auth URLs
  INTEGRATIONS_BASE_API_URL: `${window["env"]["protocol"]}://${window["env"]["domain"]}/api/integrations`,

  // User URLs
  USER_BASE_URL: `${window["env"]["protocol"]}://${window["env"]["domain"]}/users`,
  USER_BASE_API_URL: `${window["env"]["protocol"]}://${window["env"]["domain"]}/api/users`,

  // Posts URLs
  POST_BASE_URL: `${window["env"]["protocol"]}://${window["env"]["domain"]}/posts`,
  POST_BASE_API_URL: `${window["env"]["protocol"]}://${window["env"]["domain"]}/api/posts`,

  // Notifications URLs
  FLAMINGO_BASE_URL: `${window["env"]["protocol"]}://${window["env"]["domain"]}/flamingo`,
  FLAMINGO_BASE_API_URL: `${window["env"]["protocol"]}://${window["env"]["domain"]}/api/flamingo`,

  // Notifications URLs
  NOTIFICATIONS_BASE_URL: `${window["env"]["websocket"]}://${window["env"]["domain"]}`,
  NOTIFICATIONS_BASE_API_URL: `${window["env"]["protocol"]}://${window["env"]["domain"]}/api/notifications`,

  // Utilities URLs
  UTILITIES_BASE_URL: `${window["env"]["protocol"]}://${window["env"]["domain"]}/utilities`,
  UTILITIES_BASE_API_URL: `${window["env"]["protocol"]}://${window["env"]["domain"]}/api/utilities`,
  UTILITIES_GROUPS_UPLOADS: `${window["env"]["protocol"]}://${window["env"]["domain"]}/uploads/groups`,
  UTILITIES_FILES_UPLOADS: `${window["env"]["protocol"]}://${window["env"]["domain"]}/uploads/files`,
  UTILITIES_POSTS_UPLOADS: `${window["env"]["protocol"]}://${window["env"]["domain"]}/uploads/posts`,
  UTILITIES_USERS_UPLOADS: `${window["env"]["protocol"]}://${window["env"]["domain"]}/uploads/users`,
  UTILITIES_WORKSPACES_UPLOADS: `${window["env"]["protocol"]}://${window["env"]["domain"]}/uploads/workspaces`,
  UTILITIES_FLAMINGOS_UPLOADS: `${window["env"]["protocol"]}://${window["env"]["domain"]}/uploads/flamingo`,

  // Folio URLs
  FOLIO_BASE_URL: `${window["env"]["websocket"]}://${window["env"]["domain"]}/folio`,
  FOLIO_HTTP_URL: `${window["env"]["protocol"]}://${window["env"]["domain"]}/folio`,

  // MANAGEMENT_URL
  MANAGEMENT_URL: `${window["env"]["protocol"]}://${window["env"]["mgmt_portal_domain"]}`,

  // SSO properties
  SSO_AD_METHOD: window["env"]["SSO_AD_METHOD"],

  // AD properties
  active_directory_client_application_id: window["env"]["active_directory_client_application_id"],
  active_directory_authority_cloud_id: window["env"]["active_directory_authority_cloud_id"],
  active_directory_redirect_url: `${window["env"]["protocol"]}://${window["env"]["domain"]}/`,

  // LDAP properties
  LDAP_METHOD: window["env"]["LDAP_METHOD"],
};
