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
            }
        })
        .state('dashboardsList', {
            url: '/dashboards',
            views: {
                'content': {
                    templateUrl: 'dashboardList.html',
                    controller: 'MainCtrl'
                }
            }
        })
        .state('dashboardEdit', {
            url: '/dashboards/:dashboardId',
            views: {
                'content': {
                    templateUrl: 'dashboardEdit.html',
                    controller: 'DashboardCtrl'
                }
            }
        });
}]);

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

dashyAdmin.factory('auth', ['$localStorage', function($localStorage) {
    return {
        login: function(user) {
            $localStorage.dashyUser = user;
        },
        logout: function() {
            delete $localStorage.dashyUser;
        }
    };
}]);

dashyAdmin.factory('checkLogin', ['$localStorage', '$location', function($localStorage, $location) {
    if ($localStorage.dashyUser) {
        return true;
    } else {
        return false;
    }
}]);

// store globally if the server is connected
dashyAdmin.value('serverConnected', false);

// value to change with auth, now is hard coded
// dashyAdmin.value('currentUser', 'cc1f2ba3-1a19-44f2-ae78-dc9784a2a60f');

// TODO reconnect button in case the server is down at first try

// login controller
dashyAdmin.controller('LoginCtrl', ['$scope', '$localStorage', function($scope, $localStorage) {

    $scope.user = {
        username: 'hello',
        password: ''
    };

    $scope.$storage = $localStorage;

    $scope.login = function(user) {
        console.log(user);
    };

}]);

// check the server status
dashyAdmin.controller('ServerStatusCtrl', ['$scope', 'api', 'serverConnected', 'checkLogin', '$location', function($scope, api, serverConnected, checkLogin, $location) {

    var connected = api.getServerStatus();

    connected.success(function(data, status) {
        // should be 200 if it's okay
        $scope.serverStatus = status;

        // store globally that the server is connected, otherwise don't allow request
        serverConnected = true;

        // check if the user is authenticated or redirect to login page
        if (!checkLogin) {
            $location.path('/login');
        } else {

            // enable the button to open the modal to connect a new device
            $('.btn-newDevice').prop('disabled', false);
        }
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

        if ($scope.shortCode === null || $scope.shortCode.length !== 8) {

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
dashyAdmin.controller('MainCtrl', ['$scope', 'api', function($scope, api) {

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
                    content: '<i class="fa fa-3x fa-ban pull-left"></i>' + e + '<br>' + data.message
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
        $scope.dashboard.urls.push('insert url');
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
