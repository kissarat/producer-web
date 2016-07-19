const http = require('http');
const fs = require('fs');
const path = require('path');
const _ = require('underscore');

const cwd = path.normalize(__dirname + '/../app');
process.chdir(cwd);

const manifest = JSON.parse(fs.readFileSync('manifest.json'));
const mimes = manifest.mimes;

class File {
    constructor(filename, stat) {
        this.filename = filename;
        this.data = fs.readFileSync(filename);
        var mime;
        for (mime in mimes) {
            let ext = mimes[mime];
            if (filename.length === (filename.indexOf(ext) + ext.length)) {
                break;
            }
        }
        walk(this);
        this.stat = stat ? stat : fs.statSync(filename);
        this.headers = {
            'content-type': mime
        }
    }
}

class Module extends File {
    constructor(require_path) {
        var fd = require_path.filename ? require_path : Module.resolve(require_path);
        super(fd.filename, fd.stat);
    }

    static resolve(require_path) {
        try {
            var filename = require_path + '.js';
            var stat = fs.statSync(filename);
        }
        catch (ex) {
            try {
                filename = require_path + '/index.js';
                stat = fs.statSync(filename);
            }
            catch (ex) {
                throw new Error('Not found: ' + filename);
            }
        }
        return {
            filename: filename,
            stat: stat
        }
    }
}

var files = {};

function walk(file) {
    var regex = /require\('([^']+)'\)/g;
    var match;
    file.data = file.data.toString('utf8');
    while (match = regex.exec(file.data)) {
        let require_path = match[1];
        var prefix;
        if ('.' === require_path[0]) {
            prefix = file.filename.split('/').slice(0, -1);
        }
        else {
            prefix = ['lib'];
        }
        require_path = prefix.concat(require_path.split('/')).join('/');
        require_path = path.normalize(require_path);
        let fd = Module.resolve(require_path);
        file.data = file.data.replace(match[0], `importModule('${fd.filename}')`);
        if (!(fd.filename in files)) {
            let _module = new Module(fd);
            files[_module.filename] = _module;
        }
    }
}

const preload = ['manifest.json', 'index.html', 'js/load.js'];
manifest.static.concat(preload)
    .forEach(function (filename) {
        files[filename] = new File(filename);
    });

for (let filename in files) {
    let file = files[filename];
    if (file.data.indexOf('exports.') >= 0) {
        if (filename.indexOf('zone.js') < 0) {
            file.data = `exportModule('${file.filename}', function() {var exports = {}; module = {exports: exports}; var global = window;\t${file.data};\nreturn exports;\n})`;
        }
        file.data = file.data.replace(/\/\/#\s*sourceMappingURL=.*\.js\.map/, '');
    }
}

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
