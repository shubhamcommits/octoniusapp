const init = () => {
  process.env.NODE_ENV = 'development';
  process.env.FILE_UPLOAD_FOLDER = `${__dirname}/uploads/`;
};

module.exports = { init };
