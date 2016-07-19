var core = require('@angular/core');
var ibd = require('@angular/platform-browser-dynamic');

function main() {
    require('zone.js');
    // core.enableProdMode();
    core.Component({
        selector: 'body',
        template: '<h1>My First Angular 2 App</h1>'
    });
    function AppComponent() {

    }

    ibd.bootstrap(AppComponent);
}
