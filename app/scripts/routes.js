'use strict';
angular.module('dashyAdmin')
  .config(['$routeProvider',
    function($routeProvider) {
      $routeProvider
        .when('/dashboards', {
          templateUrl: 'views/listDashboards.html',
          controller: 'ListDashboardsCtrl'
        })
        .when('/dashboards/:dashboard', {
          templateUrl: 'views/changeDashboard.html',
          controller: 'ChangeDashboardCtrl'
        })
        .when('/access_token=:accessToken', {
          template: '',
          controller: 'AccessTokenCtrl'
        })
        .otherwise({
          redirectTo: '/',
          templateUrl: 'views/login.html'
        });
    }
  ])
  .controller('AccessTokenCtrl', ['$location', 'AccessToken',
    function($location, AccessToken) {
      var hash = $location.path().substr(1);
      AccessToken.setTokenFromString(hash);
      $location.path('/');
      $location.replace();
    }
  ]);
