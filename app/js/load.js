if (!manifest) {
    var manifest = {}
}

var xhr = new XMLHttpRequest();
xhr.open('GET', '/manifest.json');
xhr.onloadend = function () {
    window.manifest = JSON.parse(xhr.responseText);
    var files = manifest.static.reverse();
    function load() {
        var file = files.pop();
        if (file) {
            var script = document.createElement('script');
            script.src = '/' + file;
            script.onload = load;
            document.head.appendChild(script);
        }
        else {
            if (window.main instanceof Function) {
                document.getElementById('boot').remove();
                main();
            }
            else {
                console.error('main function not found');
            }
        }
    }
    load();
};

addEventListener('load', function () {
    xhr.send(null);
});

var Zone = {};
var modules = {};
var exports = {
    'zone.js': 'lib/zone.js/dist/zone.js'
};

function exportModule(filename, exports) {
    modules[filename] = exports;
}

function importModule(filename) {
    var exports = modules[filename];
    if (exports instanceof Function) {
        modules[filename] = exports();
    }
    return modules[filename];
}

function require(location) {
    if (location in exports) {
        return importModule(exports[location]);
    }
    var filename = 'lib/' + location + '.js';
    if (filename in modules) {
        return importModule(filename);
    }
    filename = 'lib/' + location + '/index.js';
    if (filename in modules) {
        return importModule(filename);
    }
}
