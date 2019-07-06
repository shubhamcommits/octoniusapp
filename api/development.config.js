const init = () => {
  process.env.NODE_ENV = 'development';
  process.env.PORT = '3000';
  process.env.host = `http://localhost:${process.env.PORT}/`;
  // ** For development Mode using non dockered way, please comment the line 7 & 10 and comment out the line 8 & 11 ** //
  // ** While Pushing back, change the environment variables back to the previous state ** //
  process.env.dbURL = 'mongodb://127.0.0.1:27017/octonius';
  //process.env.dbURL = 'mongodb://127.0.0.1:27017/octonius';
  process.env.JWT_KEY = 'asfsaf12safas23fsafa12sf';
  process.env.REDIS_HOST = 'redis';
  //process.env.REDIS_HOST = '127.0.0.1';
  process.env.REDIS_PORT = '6379';
  process.env.SENDGRID_KEY = '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';
  process.env.FILE_UPLOAD_FOLDER = `${__dirname}/uploads/`;
  process.env.SK_STRIPE = 'sk_test_dvebbZQPA4Vk8kKZaEuN32sD';
  process.env.stripe_plan = 'plan_EK1uRUJLJcDS6e';
  process.env.WEBHOOK_PS_SECRET = 'whsec_pmcLdxoYxBAdZswT2ZzWYep2WmnBW8Sn';
};

module.exports = { init };
