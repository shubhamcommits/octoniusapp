/**
 * This function is responsible for initilising the production configuration and environment variables
 */
function prodConfigInit() {
  process.env.NODE_ENV = 'production';
  process.env.PORT = '2000';
  process.env.host = `http://localhost:${process.env.PORT}/`;
  process.env.JWT_KEY = 'asfsaf12safas23fsafa12sf';
  process.env.dbURL = 'mongodb://mongodb:27017/octonius' || 'mongodb://127.0.0.1:27017/octonius';
  process.env.REDIS_HOST = 'redis';
  process.env.REDIS_PORT = '6379';
  process.env.SENDGRID_KEY = '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';
  process.env.FILE_UPLOAD_FOLDER = `${__dirname}/uploads/`;
  process.env.HEADER_EXTERNAL_KEY = 'HEADERIDSHAREDFOROCTONIUS';
};

export { prodConfigInit as productionConfig } 
