/**
 * This function is responsible for initilising the development configuration and environment variables
 */
function devConfigInit() {

  // ENVIRONMENTS
  process.env.NODE_ENV = 'development';
  process.env.PORT = '2000';
  process.env.host = `http://localhost:${process.env.PORT}/`;

  // JWT KEYS
  process.env.JWT_KEY = 'asfsaf12safas23fsafa12sf';

  // DATABASE CONNECTIONS
  process.env.dbURL = 'mongodb://127.0.0.1:27017/octonius';

  // REDIS
  process.env.REDIS_HOST = '127.0.0.1';
  process.env.REDIS_PORT = '6379';

  // SEND GRID
  process.env.SENDGRID_KEY = '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';

  // FILE UPLOADS FOLDER
  process.env.FILE_UPLOAD_FOLDER = `${__dirname}/uploads/`;

  // EXTERNAL KEY
  process.env.HEADER_EXTERNAL_KEY = "HEADERIDSHAREDFOROCTONIUS";

  // STRIPE KEYS
  process.env.SK_STRIPE = 'sk_test_dvebbZQPA4Vk8kKZaEuN32sD';
  process.env.stripe_plan = 'plan_EK1uRUJLJcDS6e';
  process.env.WEBHOOK_PS_SECRET = 'whsec_pmcLdxoYxBAdZswT2ZzWYep2WmnBW8Sn';
};

export { devConfigInit as developmentConfig }
