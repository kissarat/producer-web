'use strict';
const app = angular.module('producer', ['ngRoute'])

const routes = {
    '': {
        redirectTo: '/login'
    },

    'login': 'Auth',
    'logout': 'Auth'
};

function main() {
    app.config(bootstrap);
    angular.bootstrap(document, ['producer']);
}

const controllers = {};

function bootstrap($routeProvider, $locationProvider) {
    console.log('bootstrap');
    $locationProvider.html5Mode(true);

    _.each(routes, function (route, url) {
        if ('string' === typeof route) {
            route = {controller: route + 'Controller'};
        }
        if (!route.templateUrl) {
            route.templateUrl = 'view/' + url + '.html'
        }
        $routeProvider.when(url, route);
        routes[url] = route;
    });

    $routeProvider.otherwise({
        templateUrl: '404.html'
    });
}
