'use strict';
(function() {
    $('.list-group-item').on('click', function(e) {
        var previous = $(this).closest('.list-group').children('.active');
        previous.removeClass('active'); // previous list-item
        $(e.target).addClass('active'); // activated list-item
    });

    var dashyAdmin = angular.module('dashyAdmin', ['ui.bootstrap']);

    dashyAdmin.factory('api', ['$http', function($http) {
        return {
            getServerStatus: function() {
                return $http.get('http://api.dashy.io/status');
            },
            getUserDashboards: function(userID) {
                // temporary ID
                var temp = userID;
                temp = 'cc1f2ba3-1a19-44f2-ae78-dc9784a2a60f';
                return $http.get('http://api.dashy.io/users/' + temp);
            },
            getDashboard: function(dashboardID) {
                return $http.get('http://api.dashy.io/dashboards/' + dashboardID);
            },
            setDashboard: function(dashboardID, interval, name, urls) {
                return $http.post('http://api.dashy.io/dashboards/' + dashboardID, {
                    interval: interval,
                    name: name,
                    urls: urls
                });
            }
        };
    }]);

    // check the server status
    dashyAdmin.controller('serverStatus', ['$scope', 'api', function($scope, api) {
        var connected = api.getServerStatus();
        connected.success(function(data, status) {
            if (status === 200) {
                $scope.serverStatus = true;
            } else {
                $scope.serverStatus = false;
            }
        }).error(function() {
            $scope.serverStatus = false;
            $scope.serverError = 404;
        });

    }]);

    // retrieve user's dashboards and update them
    dashyAdmin.controller('userDashboards', ['$scope', 'api', '$modal', function($scope, api, $modal) {

        // fetch the dashboards
        var dashboardsIDs = api.getUserDashboards();
        dashboardsIDs.success(function(data) {
            data.dashboards.forEach(function(e) {
                // e is the dashboard ID
                api.getDashboard(e).success(function(data) {
                    data.id = e;
                    data.edit = false;
                    $scope.dashboards = [];
                    $scope.dashboards.push(data);
                });
            });
        }).error(function() {
            $scope.dashboards = []
            $scope.dashboardsError = 'Couldn\'t load your dashboards';
        });

        // update a dashboard

    }]);

}());
