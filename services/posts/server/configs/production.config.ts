/**
 * This function is responsible for initilising the production configuration and environment variables
 */
function prodConfigInit() {

  // ENVIRONMENTS
  process.env.NODE_ENV = 'production';
  process.env.PORT = '8000';
  process.env.HOST = '0.0.0.0';

  // JWT KEYS
  process.env.JWT_KEY = 'asfsaf12safas23fsafa12sf';  

  // DATABASE CONNECTIONS
  // db.createUser({ user:'octonius', pwd: 'octonius2020', roles: [{ role: 'readWrite', db: 'octonius' }] })
  process.env.dbURL = 'mongodb://mongodb:27017/octonius' || 'mongodb://127.0.0.1:27017/octonius';

  // REDIS 
  process.env.REDIS_HOST = 'redis';
  process.env.REDIS_PORT = '6379';

  // FILE UPLOADS FOLDER
  process.env.FILE_UPLOAD_FOLDER = `${__dirname}/uploads/`;

  // MAILING SERVER
  process.env.MAILING_SERVER = 'https://flash.octonius.com/api/mails';

  // AUTHS SERVER
  process.env.AUTHS_SERVER = 'https://flash.octonius.com/api/auths';

  // GROUPS SERVER
  process.env.GROUPS_SERVER = 'https://flash.octonius.com/api/groups';

  // WORKSPACES SERVER
  process.env.WORKSPACES_SERVER = 'https://flash.octonius.com/api/workspaces';

  // USERS SERVER
  process.env.USERS_SERVER = 'https://flash.octonius.com/api/users';

  // SOCKETS SERVER
  process.env.SOCKETS_SERVER = 'https://flash.octonius.com/api/users';

  // UTILITIES SERVER
  process.env.UTILITIES_SERVER = 'https://flash.octonius.com/api/utilities';
};

export { prodConfigInit as productionConfig } 
