'use strict';
// all the API calls are here
var baseApi = 'http://api.dashy.io';
angular.module('dashyAdmin').factory('Api', ['$http', function($http) {
    return {
        getServerStatus: function() {
            return $http.get(baseApi + '/status');
        },
        getUserDashboards: function(userId) {
            return $http.get(baseApi + '/users/' + userId);
        },
        newDevice: function(userId, code) {
            return $http({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    code: code
                },
                url: baseApi + '/users/' + userId + '/dashboards'
            });
        },
        getDashboard: function(dashboardId) {
            return $http.get(baseApi + '/dashboards/' + dashboardId);
        },
        deleteDashboard: function(dashboardId) {
            return $http.delete(baseApi + '/dashboards/' + dashboardId);
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
                url: baseApi + '/dashboards/' + dashboard.id
            });
        }
    };
}]);
