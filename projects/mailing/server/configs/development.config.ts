/**
 * This function is responsible for initilising the development configuration and environment variables
 */
function devConfigInit() {
  process.env.NODE_ENV = 'development';
  process.env.PORT = '2000';
  process.env.host = `http://localhost:${process.env.PORT}/`;
  process.env.dbURL = 'mongodb://127.0.0.1:27017/octonius';
  process.env.SENDGRID_KEY = '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';
};

export { devConfigInit as developmentConfig }
