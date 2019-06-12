const init = () => {
  process.env.NODE_ENV = 'development';
  process.env.PORT = '3000';
  process.env.host = `http://localhost:${process.env.PORT}/`;
  process.env.FILE_UPLOAD_FOLDER = `${__dirname}/uploads/`;
  process.env.JWT_KEY = 'asfsaf12safas23fsafa12sf';
  process.env.SENDGRID_KEY = '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';
};

module.exports = { init };
