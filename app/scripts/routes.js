'use strict';
// config the routes
angular.module('dashyAdmin').config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/dashboards');
    $stateProvider
        .state('login', {
            url: '/login',
            views: {
                'content': {
                    templateUrl: 'login.html',
                    controller: 'LoginCtrl'
                }
            },
            authenticate: false
        })
        .state('dashboardsList', {
            url: '/dashboards',
            views: {
                'content': {
                    templateUrl: 'dashboardList.html',
                    controller: 'MainCtrl'
                }
            },
            authenticate: true
        })
        .state('dashboardEdit', {
            url: '/dashboards/:dashboardId',
            views: {
                'content': {
                    templateUrl: 'dashboardEdit.html',
                    controller: 'DashboardCtrl'
                }
            },
            authenticate: true
        });
}]);