'use strict';

// UI HELPER
function startLoader() {
  $('.loader').removeClass('hidden');
}

function stopLoader() {
  $('.loader').addClass('hidden');
}

var app = angular.module('dashyAdmin', ['ngMaterial', 'ngRoute', 'oauth'])
  .config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push(['$q', '$timeout', function($q, $timeout) {
      return function(promise) {
        var defer = $q.defer();

        $timeout(function() {
          promise.then(function(data) {
            defer.resolve(data);
          });
        }, 5000);

        return defer.promise;
      };

    }]);
  }]);


app.controller('ListDashboardsCtrl', ['$scope', 'Api', function($scope, Api) {

  $scope.isLoading = true;

  $scope.$on('dashy:dashboards', function(e, userId) {
    startLoader();
    Api.getUserDashboards(userId).success(function(data) {
      $scope.isLoading = false;
      stopLoader();
      if(data.dashboards && data.dashboards.length !== 0){
        $scope.dashboards = data.dashboards;
      }
      else {
        $scope.dashboards = [];
      }
    });
  });

  $scope.$on('dashy:newDashboard', function(e, data) {
    console.log(e, data);
    $scope.dashboards.push(data);
  });

  console.log('Dashboards list');

}]);

// app.config(['$locationProvider', function($locationProvider) {
//   $locationProvider.html5Mode({
//     enabled: true,
//     requireBase: false
//   }).hashPrefix('#');
// }]);

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

// app.run(['$rootScope', '$location', 'AccessToken', function($rootScope, $location, AccessToken) {
//   $rootScope.$on('$routeChangeStart', function(event) {
//     if (AccessToken.get()) {
//       console.log('ALLOW');
//       $location.path('/dashboards');
//     } else {
//       console.log('DENY');
//       // event.preventDefault();
//       $location.path('/');
//     }
//   });
// }]);

app.controller('LoaderCtrl', ['$scope', function($scope) {

  $scope.$on('oauth:login', function() {
    startLoader();
  });

  $scope.$on('oauth:loggedOut', function() {
    stopLoader();
  });

  $scope.$on('dashy:dashboards', function() {
    stopLoader();
  });
}]);

app.controller('AddDeviceCtrl', ['$scope', '$mdDialog', 'Api', '$rootScope', function($scope, $mdDialog, Api, $rootScope) {

  $scope.show = false;

  $scope.$on('oauth:loggedOut', function() {
    $scope.show = false;
  });

  $scope.$on('dashy:dashboards', function() {
    $scope.show = true;
  });

  $scope.showModalDevice = function(ev) {
    $mdDialog.show({
        controller: AddDeviceDialogCtrl,
        templateUrl: 'views/addDevice.html',
        targetEvent: ev,
      })
      .then(function(answer) {
        $scope.alert = 'You said the information was "' + answer + '".';
      }, function() {

      });
  };

  function AddDeviceDialogCtrl($scope, $mdDialog) {

    $scope.error = 0;
    $scope.hide = function() {
      $mdDialog.hide();
    };
    $scope.close = function() {
      $mdDialog.cancel();
    };
    $scope.addDevice = function(shortcode) {
      $scope.creatingDashboard = true;
      var userId = $rootScope.user.id;
      Api.newDevice(userId, shortcode).success(function(data) {
        $scope.error = 0;
        $scope.creatingDashboard = 0;
        $rootScope.$broadcast('dashy:newDashboard', data);
        $mdDialog.hide();
      }).error(function() {
        $scope.creatingDashboard = 0;
        $scope.error = 1;
      });
    };
  }

}]);
