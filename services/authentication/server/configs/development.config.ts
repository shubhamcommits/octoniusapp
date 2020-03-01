/**
 * This function is responsible for initilising the development configuration and environment variables
 */
function devConfigInit() {

  // ENVIRONMENTS
  process.env.NODE_ENV = 'development';
  process.env.PORT = '3000';
  process.env.HOST = '0.0.0.0';

  // JWT KEY
  process.env.JWT_KEY = 'asfsaf12safas23fsafa12sf';

  // DATABASE CONNECTION
  process.env.dbURL = 'mongodb://127.0.0.1:27017/octonius';

  // REDIS
  process.env.REDIS_HOST = '127.0.0.1';
  process.env.REDIS_PORT = '6379';

  // EXTERNAL KEY
  process.env.HEADER_EXTERNAL_KEY = "HEADERIDSHAREDFOROCTONIUS";
};

export { devConfigInit as developmentConfig }
