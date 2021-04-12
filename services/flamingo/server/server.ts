import http from 'http';
import { app } from './api/app';
import cluster from 'cluster';


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

  // Define Sockets Application port
  const port = process.env.PORT || 14000;

  // Defining the Host Name
  const host: any = process.env.HOST || '0.0.0.0';

  // Environment State Variable
  const env = process.env.NODE_ENV;

  // Creating Sockets Microservice Server
  const server = http.createServer(app);

  // Initializing the sockets

  // Exposing the server to the desired port
  server.listen(port, host, () => {
    console.log(`
    
  ⚙️  Octonius Flamingo server running at: \n\t http://${host}:${port}
  
  🌏 Environment: \n\t ${env}

  💻 Process: \n\t ${process.pid} is listening to all incoming requests
  `);
  });
}