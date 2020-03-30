/**
 * This function is responsible for initilising the production configuration and environment variables
 */
function prodConfigInit() {

  // ENVIRONMENTS
  process.env.NODE_ENV = 'production';
  process.env.PORT = '5000';
  process.env.HOST = '0.0.0.0';

  // JWT KEYS
  process.env.JWT_KEY = 'asfsaf12safas23fsafa12sf';

  // DATABASE CONNECTIONS
  process.env.dbURL = 'mongodb://mongodb:27017/octonius' || 'mongodb://127.0.0.1:27017/octonius';

  // REDIS 
  process.env.REDIS_HOST = 'redis';
  process.env.REDIS_PORT = '6379';

  // SENGRID
  process.env.SENDGRID_KEY = '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';

  // FILE UPLOADS FOLDER
  process.env.FILE_UPLOAD_FOLDER = `${__dirname}/uploads/`;

  // EXTERNAL KEY
  process.env.HEADER_EXTERNAL_KEY = 'HEADERIDSHAREDFOROCTONIUS';

  // STRIPE KEYS
  process.env.SK_STRIPE = 'sk_live_WupyMoQf93S59gwTqmYpmWel';
  process.env.stripe_plan = 'plan_EK1rDLfKr9NRkU';
  process.env.WEBHOOK_PS_SECRET = 'whsec_pmcLdxoYxBAdZswT2ZzWYep2WmnBW8Sn';
};

export { prodConfigInit as productionConfig } 
