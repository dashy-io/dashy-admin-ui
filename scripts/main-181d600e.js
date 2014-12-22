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

'use strict';
// config the routes
angular.module('dashyAdmin').config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/dashboards');
    $stateProvider
        .state('login', {
            url: '/login',
            authenticate: false
        })
        .state('dashboardsList', {
            url: '/dashboards',
            views: {
                'content': {
                    templateUrl: 'dashboardList.html',
                    controller: 'DashboardsListCtrl',
                    controllerAs: 'DashboardList'
                }
            },
            authenticate: true
        })
        .state('dashboardEdit', {
            url: '/dashboards/:dashboardId',
            views: {
                'content': {
                    templateUrl: 'dashboardEdit.html',
                    controller: 'DashboardCtrl'
                }
            },
            authenticate: true
        });
}]);
'use strict';
// all the API calls are here
angular.module('dashyAdmin').factory('Api', ['$http', function($http) {
    return {
        getServerStatus: function() {
            return $http.get('http://api.dashy.io/status');
        },
        getUserDashboards: function(userId) {
            return $http.get('http://api.dashy.io/users/' + userId);
        },
        newDevice: function(dashboardId) {
            return $http({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    id: dashboardId
                },
                url: 'http://api.dashy.io/dashboards'
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
/*jshint camelcase: false */
angular.module('dashyAdmin').service('LoginService', ['$rootScope', '$timeout', '$http', '$window', '$state', function($rootScope, $timeout, $http, $window, $state) {
    'use strict';
    this.currentUser = {};
    var apiHost = 'http://api.dashy.io';
    var _loginStatus = '';
    var _this = this;

    function setStatus(status) {
        if (_loginStatus !== status) {
            console.log('LoginService status: ' + status);
            _loginStatus = status;
        }
    }
    setStatus('logging_in');

    this.reset = function() {
        this.authStatus = null;
        this.user = null;
        this.token = null;
        this.existingUser = null;
    };
    this.reset();
    this.init = function() {
        $timeout(function() {
            $window.gapi.signin.render('signInButton', {
                callback: function(authResult) {
                    $timeout(function() {
                        onSignInCallback(authResult);
                    });
                }
            });
        });
    };
    this.getStatus = function() {
        return _loginStatus;
    };
    this.isBusy = function() {
        return this.getStatus() === 'logging_in' || this.getStatus() === 'logging_out';
    };
    this.isLoggedIn = function() {
        return this.getStatus() === 'logged_in';
    };
    this.logout = function() {
        setStatus('logging_out');
        if (document.location.hostname === 'localhost') {
            revokeToken(_this.authStatus.access_token);
        }
        $window.gapi.auth.signOut();
        this.reset();
    };

    function revokeToken(access_token) {
        console.log('Disconnecting token', access_token);
        var revokeUrl = 'https://accounts.google.com/o/oauth2/revoke?token=' + access_token;
        // Perform an asynchronous GET request.
        $http.jsonp(revokeUrl)
            .success(function(data, status) {
                console.log('disconnectUser() Logged Out', data, status);
            })
            .error(function(data, status, headers, config, statusText) {
                console.log('disconnectUser() Error', data, status, statusText);
            });
    }

    function onSignInCallback(authResult) {
        if (_this.authStatus) {
            console.log('Already logged in.');
            return;
        }
        console.log('onSignInCallback() authResult:', authResult);
        _this.reset();
        if (authResult.status.signed_in) {
            _this.authStatus = authResult;
            authenticateGoogleUser();
        } else {
            $rootScope.$emit('userLogout');
            _this.currentUser = {
                id: null,
                name: null,
                imageUrl: null
            };
            setStatus('logged_out');
        }
    }

    function authenticateGoogleUser() {
        $http.post(apiHost + '/auth/google/login', {
                access_token: _this.authStatus.access_token
            })
            .success(function(data) {
                _this.token = data.token;
                console.log('loginGoogleUser() POST ~/api/google/authenticate success:', _this.token);
                if (_this.existingUser !== false) {
                    _this.existingUser = true;
                }
                $http.defaults.headers.common.Authorization = 'Bearer ' + _this.token;
                getUser();
            })
            .error(function(data, status) {
                if (status === 403) {
                    console.log('loginGoogleUser() POST ~/api/google/authenticate user not signed up:', data, status);
                    _this.existingUser = false;
                    signupGoogleUser();
                } else {
                    console.log('loginGoogleUser() POST ~/api/google/authenticate error:', data, status);
                    setStatus('logged_out');
                    _this.reset();
                }
            });
    }

    function signupGoogleUser() {
        $http.post(apiHost + '/auth/google/signup', {
                access_token: _this.authStatus.access_token
            })
            .success(function(data) {
                console.log('signupGoogleUser() POST ~/api/google/signup success:', data);
                authenticateGoogleUser();
            })
            .error(function(data, status) {
                console.log('signupGoogleUser() POST ~/api/google/signup error:', data, status);
                setStatus('logged_out');
                _this.reset();
            });
    }

    function getUser() {
        $http.get(apiHost + '/user')
            .success(function(data) {
                _this.user = data;
                console.log('getUser() GET ~/api/user success:', _this.user);
                setStatus('logged_in');
                _this.currentUser = {
                    id: _this.user.id,
                    name: _this.user.name,
                    imageUrl: _this.user.imageUrl
                };
                $rootScope.$emit('userLoggedIn');
                $state.go('dashboardsList');
            })
            .error(function(data, status) {
                console.log('getUser() GET ~/api/user error:', data, status);
                setStatus('logged_out');
                _this.reset();
            });
    }

}]);
