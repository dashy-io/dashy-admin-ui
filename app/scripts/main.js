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
angular.module('dashyAdmin').controller('LoginCtrl', ['$rootScope', '$state', 'LoginService', function($rootScope, $state, LoginService) {

    var _this = this;

    LoginService.init();

    _this.hideLogin = true;

    $rootScope.$on('userLogout', function() {
        _this.hideLogin = false;
    });

    $rootScope.$on('userLoggedIn', function() {
        _this.hideLogin = true;
        _this.user = LoginService.currentUser;
    });

    _this.logout = function() {
        LoginService.logout();
    };


}]);

// check the server status
angular.module('dashyAdmin').controller('ServerStatusCtrl', ['Api', function(Api) {

    var _this = this;

    var connected = Api.getServerStatus();

    connected.success(function(data, status) {
        // should be 200 if it's okay
        _this.status = status;

        // enable the button to open the modal to connect a new device
        $('.btn-newDevice').prop('disabled', false);

    }).error(function() {
        _this.status = 0;
    });

}]);

// check the server status
angular.module('dashyAdmin').controller('NewDeviceCtrl', ['Api', '$timeout', function(Api, $timeout) {

    this.shortCode = null;
    this.validateShortCode = null;

    // TODO finish this
    this.newDevice = function() {

        if (this.shortCode === null || this.shortCode.length !== 6) {

            this.validateShortCode = false;

        } else {

            this.validateShortCode = true;

            $('.btn-connectDevice').button('loading');

            // simulating backend call and then reset the modal, input and validation
            $timeout(function() {
                $('.btn-connectDevice').button('reset');
                $('#connectDevice').modal('hide');
                this.shortCode = '';
                this.validateShortCode = null;
            }, 1500);

            // Api.newDevice().success(function(data) {
            //     console.log(data);
            // });

        }
    };

}]);

// retrieve user's dashboards and update them
angular.module('dashyAdmin').controller('DashboardsListCtrl', ['Api', 'LoginService', function(Api, LoginService) {

    var _this = this;

    // fetch the dashboards for the current user
    var dashboardsIds = Api.getUserDashboards(LoginService.currentUser.id);

    dashboardsIds.success(function(data) {
        if (data.dashboards) {
            _this.noDashboards = false;
            data.dashboards.forEach(function(e) {
                // e is the dashboard ID
                Api.getDashboard(e).success(function(data) {
                    _this.dashboards = [];
                    _this.dashboards.push(data);
                }).error(function(data) {
                    $.snackbar({
                        content: '<i class="fa fa-3x fa-ban pull-left"></i>' + e + '<br>' + data.message,
                        timeout: 0
                    });
                });
            });
        } else {
            _this.dashboards = [];
            _this.noDashboards = true;
        }
    }).error(function() {
        _this.dashboards = [];
        _this.dashboardsError = 'Couldn\'t load your dashboards';
    });

    _this.deleteDashboard = function(dashboard) {
        if (window.confirm('Are you sure you want to delete your dashboard ' + dashboard.name)) {
            console.log('deleting ' + dashboard.id);
            // Api.deleteDashboard(id);
        }
    };

}]);

// view and update a dashboard
angular.module('dashyAdmin').controller('DashboardCtrl', ['$scope', 'Api', '$stateParams', function($scope, Api, $stateParams) {

    // fetch the current dashboards
    Api.getDashboard($stateParams.dashboardId).success(function(data) {
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
        Api.setDashboard(dashboard).success(function() {
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
