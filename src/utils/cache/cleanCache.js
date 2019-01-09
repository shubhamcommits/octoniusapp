const { clearHash } = require('./cache');

module.exports = async (req, res, next) => {
  await next();

  clearHash(req.userId);

  // Temp handle the case of udpate user role
  if (req.body.user_id) {
    clearHash(req.body.user_id);
  }
};
