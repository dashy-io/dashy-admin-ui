'use strict';

$('.list-group-item').on('click', function(e) {
    var previous = $(this).closest('.list-group').children('.active');
    previous.removeClass('active'); // previous list-item
    $(e.target).addClass('active'); // activated list-item
});

var dashyAdmin = angular.module('dashyAdmin', ['ui.bootstrap', 'ngRoute']);

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
            // temporary ID
            var temp = userId;
            temp = 'cc1f2ba3-1a19-44f2-ae78-dc9784a2a60f';
            return $http.get('http://api.dashy.io/users/' + temp);
        },
        getDashboard: function(dashboardId) {
            return $http.get('http://api.dashy.io/dashboards/' + dashboardId);
        },
        setDashboard: function(dashboard) {

            return $http({
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                },
                data: {
                    'id': dashboard.id,
                    'interval': dashboard.interval,
                    'name': dashboard.name,
                    'urls': dashboard.urls
                },
                url: 'http://api.dashy.io/dashboards/' + dashboard.id
            });
        }
    };
}]);

// check the server status
dashyAdmin.controller('ServerStatusCtrl', ['$scope', 'api', function($scope, api) {
    var connected = api.getServerStatus();
    connected.success(function(data, status) {
        // should be 200 if it's okay
        $scope.serverStatus = status;
    }).error(function() {
        $scope.serverStatus = 0;
    });

}]);

// retrieve user's dashboards and update them
dashyAdmin.controller('MainCtrl', ['$scope', 'api', function($scope, api) {

    // fetch the dashboards for the current user
    var dashboardsIds = api.getUserDashboards();
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

}]);

// view and update a dashboard
dashyAdmin.controller('DashboardCtrl', ['$scope', 'api', '$routeParams', function($scope, api, $routeParams) {

    // fetch the current dashboards
    api.getDashboard($routeParams.dashboardId).success(function(data) {
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
        console.log(dashboard);
        api.setDashboard(dashboard).success(function(data, status) {
            console.log(status);
        }).error(function(data, status) {
            // TODO tell the user that there was an error updating
            console.log('error updating');
        });
    };

}]);
