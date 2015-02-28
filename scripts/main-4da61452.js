'use strict';

var app = angular.module('dashyAdmin', ['ngMaterial', 'ui.router', 'oauth', 'ngAnimate', 'velocity.ui'])
    .config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('blue');
        $mdThemingProvider.theme('secondary')
            .primaryPalette('red');
        $mdThemingProvider.theme('success')
            .primaryPalette('green');
    });

// app.run(['$rootScope', '$state', '$stateParams', 'authorization', 'principal',
//   function($rootScope, $state, $stateParams, authorization, principal) {
//     $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams) {
//       // track the state the user wants to go to; authorization service needs this
//       $rootScope.toState = toState;
//       $rootScope.toStateParams = toStateParams;
//       // if the principal is resolved, do an authorization check immediately. otherwise,
//       // it'll be done when the state it resolved.
//       if (principal.isIdentityResolved()) authorization.authorize();
//     });
//   }
// ]);

// UI Progress Circle loader homepage
app.service('LoaderService', function() {
    this.start = function() {
        angular.element(document.querySelector('.loader')).removeClass('hidden');
    };

    this.stop = function() {
        angular.element(document.querySelector('.loader')).addClass('hidden');
    };
});

// UI Progress Circle loader dashboard operation
app.service('LoaderDashboardService', function() {
    this.start = function(i) {
        angular.element(document.getElementById('dashboard-loader' + i)).removeClass('hidden');
    };

    this.stop = function(i) {
        angular.element(document.getElementById('dashboard-loader' + i)).addClass('hidden');
    };
});


app.controller('ListDashboardsCtrl', ['$scope', '$rootScope', 'Api', 'LoaderService', '$mdToast', 'LoaderDashboardService', '$timeout', '$mdDialog',
    function($scope, $rootScope, Api, LoaderService, $mdToast, LoaderDashboardService, $timeout, $mdDialog) {

        var currentUser;

        function loadDashboards(userId) {
            Api.getUserDashboards(userId).success(function(data) {
                if (data.dashboards && data.dashboards.length !== 0) {
                    $scope.dashboardsList = data.dashboards;
                    $scope.dashboards = [];

                    // get dashboard
                    $scope.dashboardsList.forEach(function(e) {
                        Api.getDashboard(e).success(function(data) {
                            $scope.dashboards.push({
                                id: data.id,
                                name: data.name || '',
                                interval: data.interval,
                                urls: data.urls || [],
                                show: false
                            });
                            $scope.isLoading = false;
                            LoaderService.stop();
                        });
                    });
                } else {
                    $scope.dashboards = [];
                    $scope.isLoading = false;
                    LoaderService.stop();
                }
            });
        }

        $scope.toggleDashboard = function(i) {
            if (!$scope.dashboards[i].show) {
                angular.element(document.getElementById('dashboard-content' + i)).velocity('slideDown',{ duration: 400 });
                angular.element(document.getElementById('dashboard-icon' + i)).removeClass('icon-circle-down').addClass('icon-circle-up');
            } else {
                angular.element(document.getElementById('dashboard-content' + i)).velocity('slideUp',{ duration: 400 });
                angular.element(document.getElementById('dashboard-icon' + i)).removeClass('icon-circle-up').addClass('icon-circle-down');
            }
            $scope.dashboards[i].show = !$scope.dashboards[i].show;
        };

        $scope.isLoading = true;

        $rootScope.$on('dashy:userLogged', function(e, userId) {
            currentUser = userId;
            console.log('loading dashboards');
            LoaderService.start();

            $rootScope.$broadcast('dashy:loadingDashboards');

            loadDashboards(userId);
        });

        // add another url
        $scope.addUrl = function(i) {
            $scope.dashboards[i].urls.push('');
        };

        // remove an url
        $scope.removeUrl = function(i, dashboard) {
            dashboard.urls.splice(i, 1);
        };

        // update/save a dashboard
        $scope.saveDashboard = function(i, dashboard) {
            LoaderDashboardService.start(i);
            Api.setDashboard(dashboard).success(function() {
                $timeout(function() {
                    $mdToast.show(
                        $mdToast.simple()
                        .content('Dashboard ' + dashboard.name + ' updated!')
                        .position('bottom left')
                        .hideDelay(3000)
                    );
                    LoaderDashboardService.stop(i);
                }, 700);
            }).error(function(error) {
                // TODO tell the user that there was an error updating
                window.alert('error updating: ' + error);
                $timeout(function() {
                    LoaderDashboardService.stop(i);
                }, 700);
            });
        };

        $scope.deleteDashboard = function(ev, dashboard) {
            var confirm = $mdDialog.confirm()
                .title('Would you like to delete your dashboard?')
                .content('It will permanently deleted')
                .ariaLabel('Delete dashboard')
                .ok('Yes, delete it')
                .cancel('cancel')
                .targetEvent(ev);
            $mdDialog.show(confirm).then(function() {
                Api.deleteDashboard(dashboard.id);
                loadDashboards(currentUser);
            }, function() {
                console.log('cancel');
            });
        };

        $scope.$on('dashy:newDashboard', function() {
            loadDashboards(currentUser);
        });

    }
]);


app.controller('LoaderCtrl', ['$scope', 'LoaderService',
    function($scope, LoaderService) {


        $scope.$on('oauth:login', function() {
            LoaderService.start();
        });

        $scope.$on('oauth:loggedOut', function() {
            LoaderService.stop();
        });

    }
]);

app.controller('AddDeviceDialogCtrl', ['$scope', '$mdDialog', 'Api', '$rootScope', '$timeout',
    function($scope, $mdDialog, Api, $rootScope, $timeout) {

        $scope.error = false;

        $scope.hide = function() {
            $mdDialog.hide();
        };
        $scope.close = function() {
            $mdDialog.cancel();
        };

        $scope.addDevice = function(shortcode) {
            $scope.creatingDashboard = true;
            var userId = $rootScope.user.id;
            Api.newDevice(userId, shortcode).success(function(data) {
                $timeout(function() {
                    $scope.error = false;
                    $scope.creatingDashboard = false;
                    $rootScope.$broadcast('dashy:newDashboard', data);
                    $mdDialog.hide();
                }, 500);
            }).error(function() {
                $timeout(function() {
                    $scope.creatingDashboard = false;
                    $scope.error = true;
                }, 500);
            });
        };

    }
]);

app.controller('AddDeviceCtrl', ['$scope', '$mdDialog',
    function($scope, $mdDialog) {

        $scope.show = false;

        $scope.$on('oauth:loggedOut', function() {
            $scope.show = false;
        });

        $scope.$on('dashy:userLogged', function() {
            $scope.show = true;
        });

        $scope.showModalDevice = function(ev) {
            $mdDialog.show({
                    controller: 'AddDeviceDialogCtrl',
                    templateUrl: 'views/addDevice.html',
                    targetEvent: ev,
                })
                .then(function(answer) {
                    $scope.alert = 'You said the information was "' + answer + '".';
                }, function() {

                });
        };

    }
]);

'use strict';

angular.module('dashyAdmin').config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'views/login.html'
      })
      .state('dashboards', {
        url: '/dashboards',
        templateUrl: 'views/listDashboards.html',
        controller: 'ListDashboardsCtrl'
      })
      .state('access_token', {
        url: '/access_token=:accessToken',
        controller: 'AccessTokenCtrl'
      });
  }
]).controller('AccessTokenCtrl', ['$state', 'AccessToken', '$location',
  function($state, AccessToken, $location) {
    var hash = $location.path().substr(1);
    AccessToken.setTokenFromString(hash);
    $state.go('dashboards');
  }
]);

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
      newDevice: function(userId, code) {
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

'use strict';

var redirectUrl = window.location.origin + '/';

angular.module('dashyAdmin').service('AuthService', ['$rootScope', 'Api', 'AccessToken', '$http', 'LoaderService',
  function($rootScope, Api, AccessToken, $http, LoaderService) {

    var _this = this;

    _this.loginStatus = '';

    this.logout = function() {
      $rootScope.user = null;
      setStatus('logged_out');
    };

    this.authenticateGoogleUser = function() {

      LoaderService.start();

      var token = AccessToken.get();

      Api.authenticateGoogleUser(token)
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
            signupGoogleUser(token);
          } else {
            console.log('loginGoogleUser() POST ~/api/google/authenticate error:', data, status);
            setStatus('logged_out');
            $rootScope.$emit('userLoggedOut');
          }
        });
    };

    function setStatus(status) {
      if (_this.loginStatus !== status) {
        console.log('LoginService status: ' + status);
        _this.loginStatus = status;
      }
    }

    function getUser() {
      Api.getUser()
        .success(function(data) {
          _this.user = data;
          console.log('getUser() GET ~/api/user success:', _this.user);
          setStatus('logged_in');
          _this.currentUser = getUserDetails(_this.user);

          // UI updates
          $rootScope.isDashyLoggingIn = false;
          $rootScope.user = _this.currentUser;
          $rootScope.$broadcast('dashy:userLogged', _this.user.id);
        })
        .error(function(data, status) {
          LoaderService.stop();
          console.log('getUser() GET ~/api/user error:', data, status);
          setStatus('logged_out');
        });
    }

    function getUserDetails(user) {
      return {
        id: user.id,
        name: user.profiles.google[0].displayName,
        imageUrl: user.profiles.google[0].image.url
      };
    }

    function signupGoogleUser(token) {
      Api.signupGoogleUser(token)
        .success(function(data) {
          console.log('signupGoogleUser() POST ~/api/google/signup success:', data);
          _this.authenticateGoogleUser(token);
        })
        .error(function(data, status) {
          console.log('signupGoogleUser() POST ~/api/google/signup error:', data, status);
          setStatus('logged_out');
        });
    }


  }
]);

angular.module('dashyAdmin').controller('AuthCtrl', ['$scope', '$timeout', 'AccessToken', 'AuthService', '$rootScope', '$state',
  function($scope, $timeout, AccessToken, AuthService, $rootScope, $state) {

    $rootScope.redirectUrl = redirectUrl;

    $timeout(function() {
      console.log('access token: ', !!AccessToken.get());
      $scope.logged = !!AccessToken.get();
      if ($scope.logged) {
        console.log('logging in dashy (1)');
        $state.go('dashboards');
        $rootScope.isDashyLoggingIn = true;
        AuthService.authenticateGoogleUser();
        } else {
          $scope.$on('oauth:login', function() {
            $timeout(function() {
              console.log('logging in dashy (new login)');
              $state.go('dashboards');
              $rootScope.isDashyLoggingIn = true;
              AuthService.authenticateGoogleUser();
            }, 0);
          });

      }
    }, 0);

    $scope.$on('oauth:loggedOut', function() {
      AuthService.logout();
      $state.go('home');
    });


  }
]);
