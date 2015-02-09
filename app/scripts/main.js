'use strict';

var app = angular.module('dashyAdmin', ['ngMaterial', 'ngRoute', 'oauth']);

app.service('LoaderService', function() {
  this.start = function() {
    $('.loader').removeClass('hidden');
  };

  this.stop = function() {
    $('.loader').addClass('hidden');
  };

});


app.controller('ListDashboardsCtrl', ['$scope', '$rootScope', 'Api', 'LoaderService',
  function($scope, $rootScope, Api, LoaderService) {

    $scope.isLoading = true;

    $rootScope.$on('dashy:userLogged', function(e, userId) {
      console.log('loading dashboards');
      LoaderService.start();

      $rootScope.$broadcast('dashy:loadingDashboards');
      
      Api.getUserDashboards(userId).success(function(data) {
        $scope.isLoading = false;
        LoaderService.stop();
        if (data.dashboards && data.dashboards.length !== 0) {
          $scope.dashboards = data.dashboards;
        } else {
          $scope.dashboards = [];
        }
      });
    });

    $scope.$on('dashy:newDashboard', function(e, data) {
      $scope.dashboards.push(data);
    });

  }
]);

app.controller('LoaderCtrl', ['$scope', 'LoaderService',
  function($scope, LoaderService) {

    $scope.$on('oauth:login', function() {
      LoaderService.start();
    });

    $scope.$on('oauth:loggedOut', function() {
      LoaderService.stop();
    });

  }
]);

app.controller('AddDeviceDialogCtrl', ['$scope', '$mdDialog', 'Api', '$rootScope',
  function($scope, $mdDialog, Api, $rootScope) {

    $scope.error = false;

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
        $scope.error = false;
        $scope.creatingDashboard = false;
        $rootScope.$broadcast('dashy:newDashboard', data);
        $mdDialog.hide();
      }).error(function() {
        $scope.creatingDashboard = false;
        $scope.error = true;
      });
    };

  }
]);

app.controller('AddDeviceCtrl', ['$scope', '$mdDialog',
  function($scope, $mdDialog) {

    $scope.show = false;

    $scope.$on('oauth:loggedOut', function() {
      $scope.show = false;
    });

    $scope.$on('dashy:userLogged', function() {
      $scope.show = true;
    });

    $scope.showModalDevice = function(ev) {
      $mdDialog.show({
          controller: 'AddDeviceDialogCtrl',
          templateUrl: 'views/addDevice.html',
          targetEvent: ev,
        })
        .then(function(answer) {
          $scope.alert = 'You said the information was "' + answer + '".';
        }, function() {

        });
    };

  }
]);
