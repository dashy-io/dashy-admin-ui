'use strict';

var app = angular.module('dashyAdmin', ['ngMaterial', 'ngRoute', 'oauth']);

app.service('LoaderService', function() {
  this.start = function() {
    $('.loader').removeClass('hidden');
  };

  this.stop = function() {
    $('.loader').addClass('hidden');
  };

});


app.controller('ListDashboardsCtrl', ['$scope', 'Api', 'LoaderService', function($scope, Api, LoaderService) {

  $scope.isLoading = true;

  $scope.$on('dashy:dashboards', function(e, userId) {
    LoaderService.start();
    Api.getUserDashboards(userId).success(function(data) {
      $scope.isLoading = false;
      LoaderService.stop();
      if (data.dashboards && data.dashboards.length !== 0) {
        $scope.dashboards = data.dashboards;
      } else {
        $scope.dashboards = [];
      }
    });
  });

  $scope.$on('dashy:newDashboard', function(e, data) {
    $scope.dashboards.push(data);
  });

}]);

app.controller('LoaderCtrl', ['$scope', 'LoaderService', function($scope, LoaderService) {

  $scope.$on('oauth:login', function() {
    LoaderService.start();
  });

  $scope.$on('oauth:loggedOut', function() {
    LoaderService.stop();
  });

  $scope.$on('dashy:dashboards', function() {
    LoaderService.stop();
  });
}]);

app.controller('AddDeviceDialogCtrl', ['$scope', '$mdDialog', 'Api', '$rootScope',
  function($scope, $mdDialog, Api, $rootScope) {

    $scope.error = 0;
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
        $scope.error = 0;
        $scope.creatingDashboard = 0;
        $rootScope.$broadcast('dashy:newDashboard', data);
        $mdDialog.hide();
      }).error(function() {
        $scope.creatingDashboard = 0;
        $scope.error = 1;
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

    $scope.$on('dashy:dashboards', function() {
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
angular.module('dashyAdmin').config(['$routeProvider',
  function($routeProvider) {
    $routeProvider
      .when('/dashboards', {
        templateUrl: 'views/listDashboards.html',
        controller: 'ListDashboardsCtrl'
      })
      .when('/dashboards/:dashboard', {
        templateUrl: 'views/changeDashboard.html',
        controller: 'ChangeDashboardCtrl'
      })
      .when('/access_token=:accessToken', {
        template: '',
        controller: function($location, AccessToken) {
          var hash = $location.path().substr(1);
          AccessToken.setTokenFromString(hash);
          $location.path('/');
          $location.replace();
        }
      })
      .otherwise({
        redirectTo: '/',
        templateUrl: 'views/login.html'
      });
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
        return $http.get(baseUrl + '/dashboards' + dashboardId);
      },
      deleteDashboard: function(dashboardId) {
        return $http.delete(baseUrl + '/dashboards' + dashboardId);
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
angular.module('dashyAdmin').service('AuthService', ['$rootScope', 'Api', 'AccessToken', '$http', '$location', 'LoaderService',
  function($rootScope, Api, AccessToken, $http, $location, LoaderService) {

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
          LoaderService.stop();
          $rootScope.isDashyLoggingIn = false;
          $rootScope.user = _this.currentUser;
          $rootScope.$broadcast('dashy:dashboards', _this.user.id);
          $location.path('/dashboards').replace();
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

angular.module('dashyAdmin').controller('AuthCtrl', ['$scope', '$timeout', 'AccessToken', 'AuthService', '$rootScope',
  function($scope, $timeout, AccessToken, AuthService, $rootScope) {

    var isLoggedIn;

    $scope.$on('oauth:login', function() {
      console.log('logging in dashy 1');
      $rootScope.isDashyLoggingIn = true;
      AuthService.authenticateGoogleUser();
      isLoggedIn = true;
    });

    $timeout(function() {
      if (!!AccessToken.get() && !isLoggedIn) {
        console.log('logging in dashy 2');
        $rootScope.isDashyLoggingIn = true;
        AuthService.authenticateGoogleUser();
      }
    }, 0);

    $scope.$on('oauth:loggedOut', function() {
      AuthService.logout();
    });


  }
]);
