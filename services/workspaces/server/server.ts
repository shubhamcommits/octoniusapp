import http from 'http';
import { app } from './api/app';
import cluster from 'cluster';

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
} else {

  // Define Workspace Application port
  const port = process.env.PORT || 5001;

  // Defining the Host Name
  const host: any = process.env.HOST || '0.0.0.0';

  // Environment State Variable
  const env = process.env.NODE_ENV;

  // Creating Workspace Microservice Server
  const server = http.createServer(app);

  // Exposing the server to the desired port
  server.listen(port, host, () => {
    console.log(`
    
  ⚙️  Octonius Workspace server running at: \n\t http://${host}:${port}
  
  🌏 Environment: \n\t ${env}

  💻 Process: \n\t ${process.pid} is listening to all incoming requests
  `);
  });
}