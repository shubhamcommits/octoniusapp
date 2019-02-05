const init = () => {
  process.env.NODE_ENV = 'development';
  process.env.PORT = '3000';
  process.env.host = `http://localhost:${process.env.PORT}/`;
  process.env.dbURL = 'mongodb://127.0.0.1:27017/octonius';
  process.env.JWT_KEY = 'asfsaf12safas23fsafa12sf';
  process.env.SENDGRID_KEY = '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';
  process.env.FILE_UPLOAD_FOLDER = `${__dirname}/uploads/`;
  process.env.SK_STRIPE = 'sk_test_dvebbZQPA4Vk8kKZaEuN32sD';
  process.env.stripe_plan = 'plan_EK1uRUJLJcDS6e';
  process.env.WEBHOOK_PS_SECRET = 'whsec_pmcLdxoYxBAdZswT2ZzWYep2WmnBW8Sn';
};

module.exports = { init };
