'use strict';
// all the API calls are here
var baseUrl = 'http://api.dashy.io';

angular.module('dashyAdmin').factory('Api', ['$http',
    function($http) {
        return {
            getServerStatus: function() {
                return $http.get(baseUrl + '/status');
            },
            getUserDashboards: function(userId) {
                return $http.get(baseUrl + '/users/' + userId);
            },
            claimDashboard: function(userId, code) {
                return $http({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        code: code
                    },
                    url: baseUrl + '/users/' + userId + '/dashboards'
                });
            },
            getDashboard: function(dashboardId) {
                return $http.get(baseUrl + '/dashboards/' + dashboardId);
            },
            deleteDashboard: function(dashboardId) {
                return $http.delete(baseUrl + '/dashboards/' + dashboardId);
            },
            disconnectDashboard: function(userId, dashboardId) {
                return $http.delete(baseUrl + '/users/' + userId + '/dashboards/' + dashboardId);
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
                    url: baseUrl + '/dashboards/' + dashboard.id
                });
            },
            authenticateGoogleUser: function(token) {
                return $http.post(baseUrl + '/auth/google/login', {
                    /*jshint camelcase: false */
                    access_token: token.access_token
                });
            },
            getUser: function() {
                return $http.get(baseUrl + '/user');
            },
            signupGoogleUser: function(token) {
                return $http.post(baseUrl + '/auth/google/signup', {
                    /*jshint camelcase: false */
                    access_token: token.access_token
                });
            }
        };
    }
]);
