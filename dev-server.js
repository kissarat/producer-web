"use strict";

const http = require('http');

process.chdir(__dirname);
const staticServer = new (require('node-static').Server)('app');

const server = http.createServer(function (req, res) {
    if (/\/[^\.]+$/.test(req.url)) {
        req.url = '/index.html';
    }
    staticServer.serve(req, res);
});

server.listen(1991);
