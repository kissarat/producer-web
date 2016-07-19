'use strict';

_.each(controllers, function (controller, name) {
    app.controller(name + 'Controller', controller);
});
