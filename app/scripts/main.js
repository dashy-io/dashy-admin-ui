'use strict';

var app = angular.module('dashyAdmin', ['ngMaterial', 'ui.router', 'oauth', 'ngAnimate', 'velocity.ui'])
    .config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('blue');
        $mdThemingProvider.theme('secondary')
            .primaryPalette('red');
        $mdThemingProvider.theme('success')
            .primaryPalette('green');
    });

// app.run(['$rootScope', '$state', '$stateParams', 'authorization', 'principal',
//   function($rootScope, $state, $stateParams, authorization, principal) {
//     $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams) {
//       // track the state the user wants to go to; authorization service needs this
//       $rootScope.toState = toState;
//       $rootScope.toStateParams = toStateParams;
//       // if the principal is resolved, do an authorization check immediately. otherwise,
//       // it'll be done when the state it resolved.
//       if (principal.isIdentityResolved()) authorization.authorize();
//     });
//   }
// ]);

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


app.controller('ListDashboardsCtrl', ['$scope', '$rootScope', 'Api', 'LoaderService', '$mdToast', 'LoaderDashboardService', '$timeout', '$mdDialog',
    function($scope, $rootScope, Api, LoaderService, $mdToast, LoaderDashboardService, $timeout, $mdDialog) {

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
                                urls: data.urls || [],
                                show: false
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
            if (!$scope.dashboards[i].show) {
                angular.element(document.getElementById('dashboard-content' + i)).velocity('slideDown',{ duration: 400 });
                angular.element(document.getElementById('dashboard-icon' + i)).removeClass('icon-circle-down').addClass('icon-circle-up');
            } else {
                angular.element(document.getElementById('dashboard-content' + i)).velocity('slideUp',{ duration: 400 });
                angular.element(document.getElementById('dashboard-icon' + i)).removeClass('icon-circle-up').addClass('icon-circle-down');
            }
            $scope.dashboards[i].show = !$scope.dashboards[i].show;
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
                $timeout(function() {
                    $mdToast.show(
                        $mdToast.simple()
                        .content('Dashboard ' + dashboard.name + ' updated!')
                        .position('bottom left')
                        .hideDelay(3000)
                    );
                    LoaderDashboardService.stop(i);
                }, 700);
            }).error(function(error) {
                // TODO tell the user that there was an error updating
                window.alert('error updating: ' + error);
                $timeout(function() {
                    LoaderDashboardService.stop(i);
                }, 700);
            });
        };

        $scope.deleteDashboard = function(ev, dashboard) {
            var confirm = $mdDialog.confirm()
                .title('Would you like to delete your dashboard?')
                .content('It will permanently deleted')
                .ariaLabel('Delete dashboard')
                .ok('Yes, delete it')
                .cancel('cancel')
                .targetEvent(ev);
            $mdDialog.show(confirm).then(function() {
                Api.deleteDashboard(dashboard.id);
                loadDashboards(currentUser);
            }, function() {
                console.log('cancel');
            });
        };

        $scope.$on('dashy:newDashboard', function() {
            loadDashboards(currentUser);
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

app.controller('AddDeviceDialogCtrl', ['$scope', '$mdDialog', 'Api', '$rootScope', '$timeout',
    function($scope, $mdDialog, Api, $rootScope, $timeout) {

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
                $timeout(function() {
                    $scope.error = false;
                    $scope.creatingDashboard = false;
                    $rootScope.$broadcast('dashy:newDashboard', data);
                    $mdDialog.hide();
                }, 500);
            }).error(function() {
                $timeout(function() {
                    $scope.creatingDashboard = false;
                    $scope.error = true;
                }, 500);
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
