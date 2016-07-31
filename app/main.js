'use strict';

const _ = require('underscore');

const app = angular.module('producer', ['ngRoute']);

app.controllers = require('./controllers');
app.routes = {
    '': {
        redirectTo: '/login'
    },

    'login': 'Auth',
    'signup': 'User'
};

app.config(function bootstrap($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    _.each(app.routes, function (route, name) {
        var url = '/' + name;
        if ('string' === typeof route) {
            route = {controller: route + 'Controller'};
        }
        if (!route.templateUrl) {
            route.templateUrl = 'views/' + name + '.html'
        }
        $routeProvider.when(url, route);
        app.routes[name] = route;
    });

    $routeProvider.otherwise({
        templateUrl: 'views/404.html'
    });
});
// angular.bootstrap(document, ['producer']);

for (let name in app.controllers) {
    app.controller(name, app.controllers[name]);
}

(this.window ? window : global).app = app;

module.exports = app;
