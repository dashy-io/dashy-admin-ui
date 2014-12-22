'use strict';

angular.module('dashyAdmin', ['ui.router']);

// check if user is logged in on every route
angular.module('dashyAdmin').run(['$rootScope', '$state', 'LoginService', function($rootScope, $state, LoginService) {

    $rootScope.$on('$stateChangeStart',
        function(event, toState) {
            if (toState.authenticate && LoginService.getStatus() !== 'logged_in') {
                $state.go('login');
                event.preventDefault();
            }
        });

}]);

// login/logout controller
angular.module('dashyAdmin').controller('LoginCtrl', ['$rootScope', '$scope', '$state', 'LoginService', function($rootScope, $scope, $state, LoginService) {

    LoginService.init();

    $scope.hideLogin = true;

    $rootScope.$on('userLogout',function(){
        $scope.hideLogin = false;
    });

    $rootScope.$on('userLoggedIn', function(){
        $scope.hideLogin = true;
        $scope.user = LoginService.currentUser;
    });

    $scope.logout = function(){
        LoginService.logout();
    };


}]);

// check the server status
angular.module('dashyAdmin').controller('ServerStatusCtrl', ['$scope', 'api', function($scope, api) {

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
angular.module('dashyAdmin').controller('NewDeviceCtrl', ['$scope', 'api', '$timeout', function($scope, api, $timeout) {

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
angular.module('dashyAdmin').controller('MainCtrl', ['$scope', 'api', 'LoginService', function($scope, api, LoginService) {

    // fetch the dashboards for the current user
    var dashboardsIds = api.getUserDashboards(LoginService.currentUser.id);

    dashboardsIds.success(function(data) {
        if (data.dashboards) {
            $scope.noDashboards = false;
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
        } else {
            $scope.dashboards = [];
            $scope.noDashboards = true;
        }
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
angular.module('dashyAdmin').controller('DashboardCtrl', ['$scope', 'api', '$stateParams', function($scope, api, $stateParams) {

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
