const http = require('http');

const app = require('./api/app');

const { socket } = require('./utils');

const port = process.env.PORT || '3000';
const env = process.env.NODE_ENV;

const server = http.createServer(app);

const cluster = require('cluster');

if (cluster.isMaster) {

  // Fetch Number of Workers
  const numWorkers = require('os').cpus().length;

  console.log('Master cluster setting up ' + numWorkers + ' workers...');

  // Fork the process and make clusters
  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
  }

  // Cluster Method for Online
  cluster.on('online', function (worker) {
    console.log('Worker ' + worker.process.pid + ' is online');
  });

  // Cluster Method for Exit
  cluster.on('exit', function (worker, code, signal) {
    console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
    console.log('Starting a new worker');
    cluster.fork();
  });
}

else {
  socket.init(server);

  // initialzing different server for collaborative editing
  // starts
  var express = require('express');
  var appCE = express();
  var url = require('url');
  const portCE = '3001'; //get from env first.
  const serverCE = http.createServer(app);
  var path = require('path');

  // appCE.use(express.static('static'));

  // appCE.use(express.static(path.join(__dirname, 'src/utils/sharedb'))); // 
  appCE.use(express.static(path.join(__dirname, 'node_modules/quill/dist'))); //
  appCE.use(express.static(path.join(__dirname, 'node_modules/quill-cursors/dist')));

  var wssShareDB = require('./utils/sharedb/wss-sharedb')(serverCE);
  var wssCursors = require('./utils/sharedb/wss-cursors')(serverCE);

  serverCE.on('upgrade', (request, socket, head) => {

    const pathname = url.parse(request.url).pathname;

    if (pathname === '/sharedb') {
      wssShareDB.handleUpgrade(request, socket, head, (ws) => {
        wssShareDB.emit('connection', ws);
      });
    } else if (pathname === '/cursors') {
      wssCursors.handleUpgrade(request, socket, head, (ws) => {
        wssCursors.emit('connection', ws);
      });
    } else {
      socket.destroy();
    }
  });


  serverCE.listen(portCE, (req, res) => {
    // eslint-disable-next-line no-console
    console.log(`

⚙️  Octonius Collaborative Editing server running at:\n\thttp://localhost:${portCE}

🌏 Environment:\n\t${process.env.NODE_ENV}

💻 Process: \n\t ${process.pid} is listening to all incoming requests
`);
  });

  // ends


  server.listen(port, (req, res) => {
    // eslint-disable-next-line no-console
    console.log(`

⚙️  Octonius Hub server running at:\n\thttp://localhost:${port}

🌏 Environment:\n\t${env}

💻 Process: \n\t ${process.pid} is listening to all incoming requests
`);
  });

}