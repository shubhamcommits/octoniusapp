import path from 'path';

/**
 * This function is responsible for initilising the development configuration and environment variables
 */
function devConfigInit() {

  // ENVIRONMENTS
  process.env.NODE_ENV = 'development';
  process.env.PORT = '8000';
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
};

export { devConfigInit as developmentConfig }
