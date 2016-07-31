"use strict";

const http = require('http');
var config = require('./app/config.json');

process.chdir(__dirname);
const staticServer = new (require('node-static').Server)('app', {
    headers: {
        'access-control-allow-origin': config.api
    }
});

const server = http.createServer(function (req, res) {
    if (/\/[^\.]+$/.test(req.url)) {
        req.url = '/index.html';
    }
    staticServer.serve(req, res);
});

server.listen(config.static.port, config.static.host);
