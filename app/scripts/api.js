'use strict';
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