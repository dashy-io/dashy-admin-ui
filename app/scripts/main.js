'use strict';

var app = angular.module('dashyAdmin', ['ngMaterial', 'ngRoute', 'oauth']);

app.config(['$locationProvider', function($locationProvider) {
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  }).hashPrefix('!');
}]);

// check if user is logged in on every route
// app.run(['$rootScope', '$state', 'AccessToken', function($rootScope, $state, AccessToken) {

//   $rootScope.$on('$stateChangeStart',
//     function(event, toState) {
//       if (toState.authenticate && !!AccessToken.get()) {
//         $state.go('login');
//         event.preventDefault();
//       }
//     });

// }]);

app.controller('HeaderCtrl', ['$scope', '$timeout', 'AccessToken', function($scope, $timeout, AccessToken) {

  $scope.$on('oauth:profile', function(e, profile) {
    $scope.userImg = profile.image.url;
  });
  $scope.$on('oauth:authorized', function() {
    $scope.logged = !!AccessToken.get();
    console.log($scope.logged);

  });
  $scope.$on('oauth:logout', function() {
    $scope.logged = !!AccessToken.get();
    console.log($scope.logged);
  });
}]);

app.controller('LoaderCtrl', ['$scope', function($scope) {
  $scope.$on('oauth:login', function() {
    $('.loader').removeClass('hidden');
  });
}]);
