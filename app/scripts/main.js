'use strict';

$('.list-group-item').on('click', function(e) {
    var previous = $(this).closest('.list-group').children('.active');
    previous.removeClass('active'); // previous list-item
    $(e.target).addClass('active'); // activated list-item
});

var dashyAdmin = angular.module('dashyAdmin', ['ngRoute']);

// config the routes
dashyAdmin.config(['$routeProvider', '$locationProvider',
    function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'main.html',
                controller: 'MainCtrl',
                controllerAs: 'main'
            })
            .when('/dashboards/:dashboardId', {
                templateUrl: 'dashboard.html',
                controller: 'DashboardCtrl',
                controllerAs: 'dashboard'
            })
            .when('/settings', {
                template: ''
            })
            .otherwise({
                redirectTo: '/'
            });
    }
]);

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

// store globally if the server is connected
dashyAdmin.value('serverConnected', false);

// value to change with auth, now is hard coded
dashyAdmin.value('currentUser', 'cc1f2ba3-1a19-44f2-ae78-dc9784a2a60f');

// TODO reconnect button in case the server is down at first try

// check the server status
dashyAdmin.controller('ServerStatusCtrl', ['$scope', 'api', 'serverConnected', function($scope, api, serverConnected) {

    var connected = api.getServerStatus();

    connected.success(function(data, status) {
        // should be 200 if it's okay
        $scope.serverStatus = status;

        // store globally that the server is connected, otherwise don't allow request
        serverConnected = true;

        // enable the button to open the modal to connect a new device
        $('.btn-newDevice').prop('disabled', false);
    }).error(function() {
        $scope.serverStatus = 0;
    });

}]);

// check the server status
dashyAdmin.controller('NewDeviceCtrl', ['$scope', 'api', 'currentUser', '$timeout', function($scope, api, currentUser, $timeout) {

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
dashyAdmin.controller('MainCtrl', ['$scope', 'api', 'currentUser', function($scope, api, currentUser) {

    // fetch the dashboards for the current user
    var dashboardsIds = api.getUserDashboards(currentUser);
    dashboardsIds.success(function(data) {
        data.dashboards.forEach(function(e) {
            // e is the dashboard ID
            api.getDashboard(e).success(function(data) {
                $scope.dashboards = [];
                $scope.dashboards.push(data);
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
dashyAdmin.controller('DashboardCtrl', ['$scope', 'api', '$routeParams', '$timeout', function($scope, api, $routeParams, $timeout) {

    // fetch the current dashboards
    api.getDashboard($routeParams.dashboardId).success(function(data) {
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
            $('.btn-save').button('complete');
            $timeout(function() {
                $('.btn-save').button('reset');
            }, 1500);
        }).error(function(error) {
            // TODO tell the user that there was an error updating
            window.alert('error updating: ' + error);
        });
    };

}]);
