'use strict';

// $('.list-group-item').on('click', function(e) {
//     var previous = $(this).closest('.list-group').children('.active');
//     previous.removeClass('active'); // previous list-item
//     $(e.target).addClass('active'); // activated list-item
// });

var dashyAdmin = angular.module('dashyAdmin', ['ngStorage', 'ui.router']);

// config the routes
dashyAdmin.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
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

// check if user is logged in on every route
dashyAdmin.run(['$rootScope', '$state', 'authService', function($rootScope, $state, authService) {

    $rootScope.$on('$stateChangeStart',
        function(event, toState) {
            if (toState.authenticate && !authService.isLoggedIn()) {
                $state.go('login');
                event.preventDefault();
            }

        });

}]);

dashyAdmin.factory('authService', ['$localStorage', function($localStorage) {
    return {
        doLogIn: function(user) {
            $localStorage.dashyUser = user;
        },
        doLogOut: function() {
            delete $localStorage.dashyUser;
        },
        isLoggedIn: function() {
            if ($localStorage.dashyUser) {
                return true;
            } else {
                return false;
            }
        }
    };
}]);

dashyAdmin.factory('currentUser', function() {
    return {
        username: null,
        password: null
    };
});

// all the API calls are here
dashyAdmin.factory('api', ['$http', function($http) {
    return {
        getServerStatus: function() {
            return $http.get('http://api.dashy.io/status');
        },
        getUserDashboards: function(userId) {
            return $http.get('http://api.dashy.io/users/' + userId);
        },
        newDevice: function(userId, shortCode) {
            return $http({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    shortCode: shortCode
                },
                url: 'http://api.dashy.io//users/' + userId + '/claims/'
            });
        },
        getDashboard: function(dashboardId) {
            return $http.get('http://api.dashy.io/dashboards/' + dashboardId);
        },
        deleteDashboard: function(dashboardId) {
            return $http.delete('http://api.dashy.io/dashboards/' + dashboardId);
        },
        setDashboard: function(dashboard) {
            return $http({
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    'interval': dashboard.interval,
                    'name': dashboard.name,
                    'urls': dashboard.urls
                },
                url: 'http://api.dashy.io/dashboards/' + dashboard.id
            });
        }
    };
}]);

// TODO reconnect button in case the server is down at first try

// login/logout controller
dashyAdmin.controller('LoginCtrl', ['$scope', '$localStorage', '$state', '$stateParams', 'currentUser', function($scope, $localStorage, $state, $stateParams, currentUser) {

    $scope.user = currentUser;

    $scope.$storage = $localStorage;

    if ($scope.$storage.dashyUser) {
        $scope.user.isLoggedIn = true;
    }

    $scope.login = function(user) {
        $scope.user = user;
        $scope.user.isLoggedIn = true;
        $scope.$storage.dashyUser = user;
        $state.go('dashboardsList', {
            start: $stateParams.start
        }, {
            reload: true
        });
    };

    $scope.logout = function() {
        delete $scope.$storage.dashyUser;
        $scope.user.isLoggedIn = false;
        $state.go('login', {
            start: $stateParams.start
        }, {
            reload: true
        });
    };

}]);

// check the server status
dashyAdmin.controller('ServerStatusCtrl', ['$scope', 'api', function($scope, api) {

    var connected = api.getServerStatus();

    connected.success(function(data, status) {
        // should be 200 if it's okay
        $scope.serverStatus = status;

        // enable the button to open the modal to connect a new device
        $('.btn-newDevice').prop('disabled', false);

    }).error(function() {
        $scope.serverStatus = 0;
    });

}]);

// check the server status
dashyAdmin.controller('NewDeviceCtrl', ['$scope', 'api', '$timeout', function($scope, api, $timeout) {

    $scope.shortCode = null;
    $scope.validateShortCode = null;

    // TODO finish this
    $scope.newDevice = function() {

        if ($scope.shortCode === null || $scope.shortCode.length !== 6) {

            $scope.validateShortCode = false;

        } else {

            $scope.validateShortCode = true;

            $('.btn-connectDevice').button('loading');

            // simulating backend call and then reset the modal, input and validation
            $timeout(function() {
                $('.btn-connectDevice').button('reset');
                $('#connectDevice').modal('hide');
                $scope.shortCode = '';
                $scope.validateShortCode = null;
            }, 1500);

            // enable this when the api endpoint is done
            // api.newDevice(currentUser, $scope.shortCode).success(function(data) {
            //     console.log(data);
            // });

        }
    };

}]);

// retrieve user's dashboards and update them
dashyAdmin.controller('MainCtrl', ['$scope', 'api', '$localStorage', function($scope, api, $localStorage) {

    // fetch the dashboards for the current user
    var dashboardsIds = api.getUserDashboards($localStorage.dashyUser.username);
    dashboardsIds.success(function(data) {
        data.dashboards.forEach(function(e) {
            // e is the dashboard ID
            api.getDashboard(e).success(function(data) {
                $scope.dashboards = [];
                $scope.dashboards.push(data);
            }).error(function(data) {
                $.snackbar({
                    content: '<i class="fa fa-3x fa-ban pull-left"></i>' + e + '<br>' + data.message,
                    timeout: 0
                });
            });
        });
    }).error(function() {
        $scope.dashboards = [];
        $scope.dashboardsError = 'Couldn\'t load your dashboards';
    });

    $scope.deleteDashboard = function(dashboard) {
        if (window.confirm('Are you sure you want to delete your dashboard ' + dashboard.name)) {
            console.log('deleting ' + dashboard.id);
            // api.deleteDashboard(id);
        }
    };

}]);

// view and update a dashboard
dashyAdmin.controller('DashboardCtrl', ['$scope', 'api', '$stateParams', function($scope, api, $stateParams) {

    // fetch the current dashboards
    api.getDashboard($stateParams.dashboardId).success(function(data) {
        $scope.dashboard = data;
    });

    // add another url
    $scope.addUrl = function() {
        $scope.dashboard.urls.push('');
    };

    // remove an url
    $scope.removeUrl = function(url) {
        $scope.dashboard.urls.splice(url, 1);
    };

    // update/save a dashboard
    $scope.saveDashboard = function(dashboard) {
        $('.btn-save').button('loading');
        $('.btn-save').prop('disabled', true);
        api.setDashboard(dashboard).success(function() {
            $.snackbar({
                content: 'Your dashboard has been updated!'
            });
            $('.btn-save').button('reset');
        }).error(function(error) {
            // TODO tell the user that there was an error updating
            window.alert('error updating: ' + error);
        });
    };

}]);
