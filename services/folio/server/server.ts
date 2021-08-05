import http from 'http';
import { app } from './api/app';
import cluster from 'cluster';
import url from 'url';

if (cluster.isMaster) {

  // Environment State Variable
  const env = process.env.NODE_ENV

  // Fetch Number of Workers
  let numWorkers = 1

  // Scale the workers accordingly
  if(env == 'production')
    numWorkers = require('os').cpus().length

  console.log('Master cluster setting up ' + numWorkers + ' workers...');

  // Fork the process and make clusters
  for (let i = 0; i < 1; i++) {
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
} else {

  // Define Folio Application port
  const port = process.env.PORT || 11000;

  // Defining the Host Name
  const host: any = process.env.HOST || '0.0.0.0';

  // Environment State Variable
  const env = process.env.NODE_ENV;

  // Creating Folio Microservice Server
  const server = http.createServer(app);

  // Import Sharedb connection
  var wssShareDB = require('./utils/folio/wss-sharedb')(server)

  // Import Cursors connection
  var wssCursors = require('./utils/folio/wss-cursors')(server);

  // Turn on the sockets to create the connection
  server.on('upgrade', (request, socket, head) => {

    // Get the path parameter
    const pathname = url.parse(request.url).pathname;

    // If path is sharedb, then emit the connection
    if (pathname === '/editor') {
      wssShareDB.handleUpgrade(request, socket, head, (ws) => {
        wssShareDB.emit('connection', ws)
      })
    }
    else if (pathname === '/cursors') {
      wssCursors.handleUpgrade(request, socket, head, (ws) => {
        wssCursors.emit('connection', ws);
      }); 
    }
    else {
      socket.destroy()
    }
  });

  // Exposing the server to the desired port
  server.listen(port, host, () => {
    console.log(`
    
  ⚙️  Octonius Folio server running at: \n\t http://${host}:${port}
  
  🌏 Environment: \n\t ${env}

  💻 Process: \n\t ${process.pid} is listening to all incoming requests
  `);
  });
}