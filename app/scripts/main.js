'use strict';

angular.module('dashyAdmin', ['ui.router']);

// check if user is logged in on every route
angular.module('dashyAdmin').run(['$rootScope', '$state', function($rootScope, $state) {

    $rootScope.$on('$stateChangeStart',
        function(event, toState) {
            if (toState.authenticate) {
                $state.go('login');
                event.preventDefault();
            }
        });

}]);

// angular.module('dashyAdmin').service('LoginService', ['$window', function($window) {

//     this.login = function() {

        

//     };

    




//     function authenticateGoogleUser() {
//         $http.post(apiHost + '/auth/google/login', {
//                 access_token: _this.authStatus.access_token
//             })
//             .success(function(data) {
//                 _this.token = data.token;
//                 console.log('loginGoogleUser() POST ~/api/google/authenticate success:', _this.token);
//                 if (_this.existingUser !== false) {
//                     _this.existingUser = true;
//                 }
//                 $http.defaults.headers.common.Authorization = 'Bearer ' + _this.token;
//                 getUser();
//             })
//             .error(function(data, status) {
//                 if (status === 403) {
//                     console.log('loginGoogleUser() POST ~/api/google/authenticate user not signed up:', data, status);
//                     _this.existingUser = false;
//                     signupGoogleUser();
//                 } else {
//                     console.log('loginGoogleUser() POST ~/api/google/authenticate error:', data, status);
//                     setStatus('logged_out');
//                     _this.reset();
//                 }
//             });
//     }
// }]);

// login/logout controller
angular.module('dashyAdmin').controller('LoginCtrl', ['$rootScope', '$state', function($rootScope, $state) {

    var _this = this;

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
angular.module('dashyAdmin').controller('NewDeviceCtrl', ['$rootScope', 'Api', function($rootScope, Api) {

    // OrQyug temp code

    var _this = this;

    _this.shortCode = null;
    _this.validateShortCode = null;
    _this.user = null;


    $rootScope.$on('userLoggedIn', function() {
        _this.user = LoginService.currentUser;
    });

    // TODO finish _this
    _this.newDevice = function() {

        if (_this.shortCode === null || _this.shortCode.length !== 6) {

            _this.validateShortCode = false;

        } else {

            _this.validateShortCode = true;

            $('.btn-connectDevice').button('loading');

            Api.newDevice(_this.user.id, _this.shortCode).success(function(data) {
                // reset the button
                $('.btn-connectDevice').button('reset');

                // close modal
                $('#connectDevice').modal('hide');

                // reset field
                _this.shortCode = '';
                _this.validateShortCode = null;

                console.log(data);
            }.error(function(err) {
                console.log(err);
            }));

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
