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


app.controller('ListDashboardsCtrl', ['$scope', '$rootScope', '$q', 'Api', 'LoaderService', '$mdToast', 'LoaderDashboardService', '$timeout', '$mdDialog', '$filter',
    function($scope, $rootScope, $q, Api, LoaderService, $mdToast, LoaderDashboardService, $timeout, $mdDialog, $filter) {

        var currentUser;

        // Use orderBy built-in filter only when loading dashboards
        var orderBy = $filter('orderBy');

        function loadDashboards() {

            Api.getUserDashboards().success(function(data) {
                if (data.dashboards && data.dashboards.length !== 0) {
                    $scope.dashboardsList = data.dashboards;
                    $scope.dashboards = [];

                    // get dashboard
                    $scope.dashboardsList.forEach(function(e) {
                        loadSingleDashboard(e);
                    });
                    
                } else {
                    $scope.dashboards = [];
                    $scope.isLoading = false;
                    LoaderService.stop();
                }
            });

        }

        function loadSingleDashboard(dashboard) {

            Api.getDashboard(dashboard).success(function(data) {
                $scope.dashboards.push({
                    id: data.id,
                    name: data.name || '',
                    interval: data.interval,
                    urls: data.urls || [],
                    show: false
                });
                $scope.dashboards = orderBy($scope.dashboards, 'name', false);
                $scope.isLoading = false;
                LoaderService.stop();
            });
        }

        function loadNewSingleDashboard(dashboard) {

            Api.getDashboard(dashboard).success(function(data) {

                $scope.dashboards.unshift({
                    id: data.id,
                    name: data.name || '',
                    interval: data.interval,
                    urls: data.urls || [],
                    show: true
                });

                $timeout(function() {
                    angular.element(document.getElementById(dashboard)).velocity('slideDown', {
                        duration: 333
                    });
                    angular.element(document.getElementById('icon-' + dashboard)).removeClass('icon-circle-down').addClass('icon-circle-up');
                }, 0);

            });
        }

        $scope.toggleDashboard = function(dashboard) {
            if (!dashboard.show) {
                angular.element(document.getElementById(dashboard.id)).velocity('slideDown', {
                    duration: 333
                });
                angular.element(document.getElementById('icon-' + dashboard.id)).removeClass('icon-circle-down').addClass('icon-circle-up');
            } else {
                angular.element(document.getElementById(dashboard.id)).velocity('slideUp', {
                    duration: 333
                });
                angular.element(document.getElementById('icon-' + dashboard.id)).removeClass('icon-circle-up').addClass('icon-circle-down');
            }
            dashboard.show = !dashboard.show;
        };

        $scope.isLoading = true;

        $rootScope.$on('dashy:userLogged', function(e, userId) {
            currentUser = userId;
            console.log('loading dashboards');
            LoaderService.start();

            $rootScope.$broadcast('dashy:loadingDashboards');

            loadDashboards();
        });

        // add another url
        $scope.addUrl = function(dashboard) {
            dashboard.urls.push('');
        };

        // remove an url
        $scope.removeUrl = function(i, dashboard) {
            dashboard.urls.splice(i, 1);
        };

        // update/save a dashboard
        $scope.saveDashboard = function(i, dashboard) {

            // validate interval must be at least 10 seconds
            if (dashboard.interval < 10) {
                var alert = $mdDialog.confirm({
                    title: 'Attention',
                    content: 'Interval must be at least 10 seconds',
                    ok: 'Okay I will change it'
                });
                $mdDialog.show(alert);
            } else {
                LoaderDashboardService.start(i);
                Api.setDashboard(dashboard).success(function(data) {
                    console.log(data);
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
            }

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
                Api.disconnectDashboard(currentUser, dashboard.id).then(function() {
                    Api.deleteDashboard(dashboard.id).then(function() {
                        loadDashboards();
                        $mdToast.show(
                            $mdToast.simple()
                            .content('Dashboard ' + dashboard.name + ' deleted!')
                            .position('bottom left')
                            .hideDelay(3000)
                        );
                    });
                });
            }, function() {
                console.log('cancel');
            });
        };

        $scope.$on('dashy:newDashboard', function(e, list) {
            var lastDashboard = list.length - 1;
            console.log(list[lastDashboard]);

            loadNewSingleDashboard(list[lastDashboard]);

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
            Api.claimDashboard(userId, shortcode).success(function(data) {
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
            });
        };

    }
]);
