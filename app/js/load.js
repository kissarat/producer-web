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
            if (/\.html$/.test(file)) {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', file);
                xhr.send(null);
                xhr.onloadend = function (e) {
                    var tag = document.createElement('div');
                    tag.innerHTML = e.target.responseText;
                    document.body.appendChild(tag.childNodes[0]);
                    load();
                }
            }
            else {
                var tag;
                if (/\.js$/.test(file)) {
                    tag = document.createElement('script');
                    tag.src = '/' + file;
                }
                else if (/\.css/.test(file)) {
                    tag = document.createElement('link');
                    tag.setAttribute('rel', 'stylesheet');
                    tag.setAttribute('type', 'text/css');
                    tag.href = '/' + file;
                }
                tag.onload = load;
                document.head.appendChild(tag);
            }
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
