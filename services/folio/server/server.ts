import http from 'http';
import { app } from './api/app';
import cluster from 'cluster';
import url from 'url';
import { v4 as uuid } from 'uuid';

import ShareDB from 'sharedb';
ShareDB.types.register(require('rich-text').type);

var ws = require('ws');
var WebSocketJSONStream = require('websocket-json-stream');
var debug = require('debug')('quill-sharedb-cursors:sharedb');

if (cluster.isMaster) {

  // Fetch Number of Workers
  const numWorkers = require('os').cpus().length;

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

  /**
   * Settup Sharedb connection STARTS
   */
  var shareDBServer = new ShareDB({
      db: require('sharedb-mongo')(process.env.DB_URL || 'mongodb://127.0.0.1:27017/octonius?auto_reconnect=true', {
          useUnifiedTopology: true,
          useNewUrlParser: true
      }),
      disableDocAction: true,
      disableSpaceDelimitedActions: true
  });

  var wssShareDB = new ws.Server({
    noServer: true
  });
  
  wssShareDB.on('connection', function (ws, req) {

      // generate an id for the socket
      ws.id = uuid();
      ws.isAlive = true;

      debug('A new client (%s) connected.', ws.id);

      var stream = new WebSocketJSONStream(ws);
      shareDBServer.listen(stream);

      ws.on('pong', function (data, flags) {
          debug('Pong received. (%s)', ws.id);
          ws.isAlive = true;
      });

      ws.on('error', function (error) {
          debug('Client connection errored (%s). (Error: %s)', ws.id, error);
      });
  });

  // Sockets Ping, Keep Alive
  setInterval(function () {
      wssShareDB.clients.forEach(function (ws) {
          if (ws.isAlive === false) return ws.terminate();

          ws.isAlive = false;
          ws.ping();
          debug('Ping sent. (%s)', ws.id);
      });
  }, 30000);
  /**
   * Settup Sharedb connection ENDS
   */

  /**
   * Settup Cursors connection STARTS
   */
  //var wssCursors = require('./utils/folio/wss-cursors')(server);
  /**
   * Settup Cursors connection STARTS
   */

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
    /*
    else if (pathname === '/cursors') {
      wssCursors.handleUpgrade(request, socket, head, (ws) => {
        wssCursors.emit('connection', ws);
      }); 
    }
    */
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