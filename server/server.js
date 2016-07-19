const http = require('http');
const fs = require('fs');
const path = require('path');
const _ = require('underscore');

const cwd = path.normalize(__dirname + '/../app');
process.chdir(cwd);

const manifest = JSON.parse(fs.readFileSync('manifest.json'));
const mimes = manifest.mimes;

for(let mime in mimes) {
    mimes[mime] = new RegExp(`\\.${mimes[mime]}$`, 'i');
}

class File {
    constructor(filename, stat) {
        this.filename = filename;
        this.data = fs.readFileSync(filename);
        var mime;
        for (mime in mimes) {
            if (mimes[mime].test(filename)) {
                break;
            }
        }
        this.stat = stat ? stat : fs.statSync(filename);
        this.headers = {
            'content-type': mime
        }
    }
}

var files = {};

const preload = ['manifest.json', 'index.html', 'js/load.js'];
manifest.static.concat(preload)
    .forEach(function (filename) {
        files[filename] = new File(filename);
    });

manifest.static = [];
_.each(_.omit(files, preload), function (file, filename) {
    manifest.static.push(filename);
});

files['manifest.json'].data = JSON.stringify(manifest);

var server = http.createServer(function (req, res) {
    if ('/static' == req.url) {
        return res.end(JSON.stringify(Object.keys(files)));
    }
    var file = files[req.url.slice(1)];
    if (!file) {
        file = files['index.html'];
    }
    res.writeHead(200, file.headers);
    res.end(file.data);
});

server.listen(10000, function () {
    fs.watch('.', {recursive: true}, function (e, filename) {
        if (filename in files) {
            files[filename] = new File(filename);
            console.log(new Date().toLocaleTimeString(), filename);
        }
    });
    process.title = manifest.name;
    console.log('Loaded');
});
