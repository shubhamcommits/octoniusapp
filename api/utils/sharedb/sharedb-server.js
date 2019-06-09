var ShareDB = require('sharedb');

ShareDB.types.register(require('rich-text').type);

module.exports = new ShareDB({
  db: require('sharedb-mongo')(process.env.dbURL || 'mongodb://mongodb:27017/octonius?auto_reconnect=true')
});
