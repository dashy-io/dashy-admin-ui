'use strict';

angular.module('dashyAdmin').config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'views/login.html'
            })
            .state('dashboards', {
                url: '/dashboards',
                templateUrl: 'views/listDashboards.html',
                controller: 'ListDashboardsCtrl'
            })
            .state('access_token', {
                url: '/access_token=:accessToken',
                controller: 'AccessTokenCtrl'
            });
    }
]).controller('AccessTokenCtrl', ['$state', 'AccessToken', '$location',
    function($state, AccessToken, $location) {
        var hash = $location.path().substr(1);
        AccessToken.setTokenFromString(hash);
        $state.go('dashboards');
    }
]);
