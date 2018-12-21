const http = require('http');

const app = require('./src/api/app');

const { socket } = require('./src/utils');

const port = process.env.PORT || '3000';
const server = http.createServer(app);

socket.init(server);

// Private section migration helper
const helper = require('./src/utils/privateSectionMigrationHelper');

// helper.createPrivateGroups();

server.listen(port, (req, res) => {
  // eslint-disable-next-line no-console
  console.log(`

⚙️  Octonius Hub server running at:\n\thttp://localhost:${port}

🌏 Environment:\n\t${process.env.NODE_ENV}
`);
});
