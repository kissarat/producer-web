const http = require('http');
const fs = require('fs');
const path = require('path');
const underscore = require('underscore');

var cwd = path.normalize(__dirname + '/../app');
process.chdir(cwd);

const pack = JSON.parse(fs.readFileSync('manifest.json'));
const mimes = pack.mimes;

class File {
    constructor(path, stat) {
        this.data = fs.readFileSync(path);
        var mime;
        for (mime in mimes) {
            let ext = mimes[mime];
            if (path.length === (path.indexOf(ext) + ext.length - 1)) {
                break;
            }
        }
        this.stat = stat ? stat : fs.statSync(path);
        this.headers = {
            'content-type': mime
        }
    }
}

var files = {};

function walk(dirname) {
    fs.readdirSync(dirname).forEach(function (filename) {
        filename = path.join(dirname, filename);
        var stat = fs.statSync(filename);
        if (stat.isDirectory()) {
            walk(filename);
        }
        else if (/\.(html|js|css)$/.test(filename) && !/node_modules.*\.min\.\w+$/.test(filename)) {
            files[filename] = new File(filename, stat);
        }
    })
}

pack.static.concat(['manifest.json', 'index.html']).reverse()
    .forEach(function (filename) {
    files[filename] = new File(filename);
});

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
});
