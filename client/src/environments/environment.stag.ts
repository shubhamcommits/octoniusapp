export const environment = {

  // Environment Configs
  production: true,
  hmr: false,

  //slack redirect url for authentication
  slack_redirect_url:`https://slack.com/oauth/v2/authorize`,

  // Browser Storage Key
  storageKey: 'storageKey@20xx',

  // GOOGLE properties
  GOOGLE_SCOPE: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/admin.directory.userschema.readonly',
    'https://www.googleapis.com/auth/admin.directory.group.readonly'
  ].join(' '),
  GOOGLE_LOGIN_SCOPE: [
    'profile',
    'email'
  ].join(` `),

  GOOGLE_OCTONIUS_CLIENT_ID: '833088201902-u8f2kkpve0tsm0qcrq4f40i65bthns9n.apps.googleusercontent.com',

  // Base Client Url
  clientUrl: `${window["env"]["protocol"]}://${window["env"]["domain"]}`,

  // Octo-doc URL
  REAL_TIME_URL: 'localhost:80/editor',

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

  // Folio URLs
  FOLIO_BASE_URL: `ws://localhost:80/folio`,
  FOLIO_HTTP_URL: `http://localhost:80/folio`,


  // Notifications URLs
  NOTIFICATIONS_BASE_URL: 'ws://localhost:80',
  NOTIFICATIONS_BASE_API_URL: 'http://localhost:80/api/notifications',

  // Approval URLs
  APPROVAL_BASE_URL: 'http://localhost:80/flamingo',
  APPROVAL_BASE_API_URL: 'http://localhost:80/api/approval',

  // Utilities URLs
  UTILITIES_BASE_URL: 'http://localhost:80/utilities',
  UTILITIES_BASE_API_URL: 'http://localhost:80/api/utilities',
  UTILITIES_GROUPS_UPLOADS: 'http://localhost:80/uploads/groups',
  //UTILITIES_GROUP_FILES_UPLOADS: `http://localhost:80/uploads/groupsFiles`,
  UTILITIES_POSTS_UPLOADS: 'http://localhost:80/uploads/posts',
  UTILITIES_USERS_UPLOADS: 'http://localhost:80/uploads/users',
  UTILITIES_WORKSPACES_UPLOADS: 'http://localhost:80/uploads/workspaces',
  UTILITIES_FLAMINGOS_UPLOADS: 'http://localhost:80/uploads/flamingo',

  // Chats URLs
  CHATS_BASE_URL: `http://localhost:80/chats`,
  CHATS_BASE_API_URL: `http://localhost:80/api/chats`,

  // MANAGEMENT_URL: 'https://management.octonius.com',
  MANAGEMENT_URL: `${window["env"]["protocol"]}://${window["env"]["mgmt_portal_domain"]}`,
};
