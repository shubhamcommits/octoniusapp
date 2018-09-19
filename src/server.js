const http = require('http');

const app = require('./api/app');

const port = process.env.PORT || '3000';
const server = http.createServer(app);

server.listen(port, (req, res) => {
  // eslint-disable-next-line no-console
  console.log(`

⚙️  Octonius Hub server running at:\n\thttp://localhost:${port}

🌏 Environment:\n\t${process.env.NODE_ENV}
`);
});
