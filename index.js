'use strict';

const os = require('os');
const cluster = require('cluster');

if (cluster.isMaster) {
    for (let i = 0; i < os.cpus().length; i++) {
        cluster.fork();
    }

    // Listen for dying workers
    cluster.on('exit', function (worker) {
        // Replace the dead worker
        console.log('Worker %d died :(', worker.id);
        cluster.fork();
    });
}
else {
    require('./src/server');
}