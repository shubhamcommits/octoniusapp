const http = require('http');

const app = require('./api/app');

const { socket } = require('./utils');

const port = process.env.PORT;
const env = process.env.NODE_ENV;

const server = http.createServer(app);

socket.init(server);

server.listen(port, (req, res) => {
  // eslint-disable-next-line no-console
  console.log(`

⚙️  Octonius Hub server running at:\n\thttp://localhost:${port}

🌏 Environment:\n\t${env}
`);
});
