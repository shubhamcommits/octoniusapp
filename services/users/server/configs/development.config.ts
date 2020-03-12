import path from 'path';

/**
 * This function is responsible for initilising the development configuration and environment variables
 */
function devConfigInit() {

  // ENVIRONMENTS
  process.env.NODE_ENV = 'development';
  process.env.PORT = '7000';
  process.env.HOST = '0.0.0.0';

  // JWT KEYS
  process.env.JWT_KEY = 'asfsaf12safas23fsafa12sf';

  // DATABASE CONNECTIONS
  process.env.dbURL = 'mongodb://127.0.0.1:27017/octonius';

  // REDIS
  process.env.REDIS_HOST = '127.0.0.1';
  process.env.REDIS_PORT = '6379';

  // FILE UPLOADS FOLDER
  process.env.FILE_UPLOAD_FOLDER = path.join(__dirname, '../../../../uploads/');

  // MAILING SERVER
  process.env.MAILING_SERVER = 'http://0.0.0.0:2000';

  // AUTHS SERVER
  process.env.AUTHS_SERVER = 'http://0.0.0.0:3000';

  // GROUPS SERVER
  process.env.GROUPS_SERVER = 'http://0.0.0.0:4000';

  // WORKSPACES SERVER
  process.env.WORKSPACES_SERVER = 'http://0.0.0.0:5000';

  // USERS SERVER
  process.env.USERS_SERVER = 'http://0.0.0.0:7000';

  // UTILITIES SERVER
  process.env.UTILITIES_SERVER = 'http://0.0.0.0:8000';

  // SOCKETS SERVER
  process.env.SOCKETS_SERVER = 'http://0.0.0.0:9000';
};

export { devConfigInit as developmentConfig }
