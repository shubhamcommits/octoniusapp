import ShareDB from 'sharedb'

ShareDB.types.register(require('rich-text').type);

export default new ShareDB({
    db: require('sharedb-mongo')(process.env.DB_URL || 'mongodb://127.0.0.1:27017/octonius?auto_reconnect=true', {
        useUnifiedTopology: true,
        useNewUrlParser: true
    }),
    disableDocAction: true,
    disableSpaceDelimitedActions: true,
});
