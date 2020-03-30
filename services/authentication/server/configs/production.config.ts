/**
 * This function is responsible for initilising the production configuration and environment variables
 */
function prodConfigInit() {

  // ENVIRONMENTS
  process.env.NODE_ENV = 'production';
  process.env.PORT = '3000';
  process.env.HOST = '0.0.0.0';

  // JWT KEY
  process.env.JWT_KEY = 'asfsaf12safas23fsafa12sf';

  // DATABASE CONNECTION
  process.env.dbURL = 'mongodb://mongo:27017/octonius' || 'mongodb://127.0.0.1:27017/octonius';

  // REDIS
  process.env.REDIS_HOST = 'redis';
  process.env.REDIS_PORT = '6379';

  // EXTERNAL KEY
  process.env.HEADER_EXTERNAL_KEY = 'HEADERIDSHAREDFOROCTONIUS';
};

export { prodConfigInit as productionConfig } 
