'use strict';

var tlm = angular.module('tlm', [
    'ui.bootstrap', 
    'ui.router',
    'btford.socket-io']);

// configure the main module
tlm.config([
    '$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider',
    function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

        $stateProvider
            // routes for home module
            .state('home', {
                title: 'Home',
                url: '/',
                views: {
                    'main': {
                        templateUrl: 'assets/templates/home.html',
                        controller: 'homeController'
                    }
                }
            });

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });

        $httpProvider.interceptors.push(['$q', '$location', function($q, $location) {
            return {
                'responseError': function(response) {
                    if (response.status === 401 || response.status === 403) {
                        $location.path('/');
                        return $q.reject(response);
                    }
                    else {
                        return $q.reject(response);
                    }
                }
            };
        }]);
    }
])

.factory('socket', function (socketFactory) {
    return socketFactory();
});
