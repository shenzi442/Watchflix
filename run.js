const cluster = require('node:cluster');
const http = require('node:http');
const numCPUs = require('node:os').cpus().length;
const process = require('node:process');

const Server = require('./server');

if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);
    console.log(`Creating ${numCPUs} CPU instances`)

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
} else {
    // Workers can share any TCP connection
    // In this case it is an HTTP server
    Server();

    console.log(`Worker ${process.pid} started`);
}