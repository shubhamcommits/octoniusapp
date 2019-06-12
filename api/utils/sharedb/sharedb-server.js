var ShareDB = require('sharedb');

ShareDB.types.register(require('rich-text').type);

module.exports = new ShareDB({
  db: require('sharedb-mongo')(process.env.dbURL || 'mongodb://127.0.0.1:27017/octonius?auto_reconnect=true')
});
