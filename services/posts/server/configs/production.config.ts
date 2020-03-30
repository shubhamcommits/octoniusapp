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
  process.env.dbURL = 'mongodb://mongodb:27017/octonius' || 'mongodb://127.0.0.1:27017/octonius';

  // REDIS 
  process.env.REDIS_HOST = 'redis';
  process.env.REDIS_PORT = '6379';

  // FILE UPLOADS FOLDER
  process.env.FILE_UPLOAD_FOLDER = `${__dirname}/uploads/`;
};

export { prodConfigInit as productionConfig } 
