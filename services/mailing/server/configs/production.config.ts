/**
 * This function is responsible for initilising the production configuration and environment variables
 */
function prodConfigInit() {

  // ENVIRONMENTS
  process.env.NODE_ENV = 'production';
  process.env.PORT = '2000';
  process.env.HOST = '0.0.0.0';

  // DATABASE CONNECTION
  process.env.dbURL = 'mongodb://mongo:27017/octonius' || 'mongodb://127.0.0.1:27017/octonius';

  // SENDGRID
  process.env.SENDGRID_KEY = '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';
};

export { prodConfigInit as productionConfig } 
