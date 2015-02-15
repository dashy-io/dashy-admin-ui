'use strict';

var app = angular.module('dashyAdmin', ['ngMaterial', 'ui.router', 'oauth']);

// UI Progress Circle loader homepage
app.service('LoaderService', function() {
  this.start = function() {
    angular.element(document.querySelector('.loader')).removeClass('hidden');
  };

  this.stop = function() {
    angular.element(document.querySelector('.loader')).addClass('hidden');
  };
});

// UI Progress Circle loader dashboard operation
app.service('LoaderDashboardService', function() {
  this.start = function(i) {
    angular.element(document.getElementById('dashboard-loader' + i)).removeClass('hidden');
  };

  this.stop = function(i) {
    angular.element(document.getElementById('dashboard-loader' + i)).addClass('hidden');
  };
});


app.controller('ListDashboardsCtrl', ['$scope', '$rootScope', 'Api', 'LoaderService', '$mdToast', 'LoaderDashboardService',
  function($scope, $rootScope, Api, LoaderService, $mdToast, LoaderDashboardService) {

    var currentUser;

    function loadDashboards(userId) {
      Api.getUserDashboards(userId).success(function(data) {
        if (data.dashboards && data.dashboards.length !== 0) {
          $scope.dashboardsList = data.dashboards;
          $scope.dashboards = [];

          // get dashboard
          $scope.dashboardsList.forEach(function(e) {
            Api.getDashboard(e).success(function(data) {
              $scope.dashboards.push({
                id: data.id,
                name: data.name || '',
                interval: data.interval,
                urls: data.urls || []
              });
              $scope.isLoading = false;
              LoaderService.stop();
            });
          });
        } else {
          $scope.dashboards = [];
          $scope.isLoading = false;
          LoaderService.stop();
        }
      });
    }

    $scope.toggleDashboard = function(i) {
      angular.element(document.getElementById('dashboard-content' + i)).toggleClass('hidden');
    };

    $scope.isLoading = true;

    $rootScope.$on('dashy:userLogged', function(e, userId) {
      currentUser = userId;
      console.log('loading dashboards');
      LoaderService.start();

      $rootScope.$broadcast('dashy:loadingDashboards');

      loadDashboards(userId);
    });

    // add another url
    $scope.addUrl = function(i) {
      $scope.dashboards[i].urls.push('');
    };

    // remove an url
    $scope.removeUrl = function(i, dashboard) {
      dashboard.urls.splice(i, 1);
    };

    // update/save a dashboard
    $scope.saveDashboard = function(i, dashboard) {
      LoaderDashboardService.start(i);
      Api.setDashboard(dashboard).success(function() {
        $mdToast.show($mdToast.simple().content('Dashboard updated!'));
        LoaderDashboardService.stop(i);
      }).error(function(error) {
        // TODO tell the user that there was an error updating
        window.alert('error updating: ' + error);
        LoaderDashboardService.stop(i);
      });
    };

    $scope.$on('dashy:newDashboard', function() {
      loadDashboards(currentUser);
    });

  }
]);

<<<<<<< HEAD
angular.module('dashyAdmin').controller('NewDeviceBtnCtrl', ['$rootScope', function($rootScope) {

    var _this = this;
    this.userLogged = false;
=======
app.controller('LoaderCtrl', ['$scope', 'LoaderService',
  function($scope, LoaderService) {
>>>>>>> material-ui

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

<<<<<<< HEAD
}]);

// retrieve user's dashboards and update them
angular.module('dashyAdmin').controller('DashboardsListCtrl', ['Api', 'LoginService', function(Api, LoginService) {

    var _this = this;

    // fetch the dashboards for the current user
    var dashboardsIds = Api.getUserDashboards(LoginService.currentUser.id);

    dashboardsIds.success(function(data) {
        if (data.dashboards) {
            _this.noDashboards = false;
            _this.dashboards = [];
            data.dashboards.forEach(function(id) {
                Api.getDashboard(id).success(function(data) {
                    _this.dashboards.push(data);
                }).error(function(data) {
                    $.snackbar({
                        content: '<i class="fa fa-3x fa-ban pull-left"></i>' + id + '<br>' + data.message,
                        timeout: 0
                    });
                });
            });
        } else {
            _this.dashboards = [];
            _this.noDashboards = true;
        }
    }).error(function() {
        _this.dashboards = [];
        _this.dashboardsError = 'Couldn\'t load your dashboards';
    });
=======
    $scope.close = function() {
      $mdDialog.cancel();
    };
>>>>>>> material-ui

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
