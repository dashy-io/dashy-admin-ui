'use strict';

var redirectUrl = window.location.origin + '/';

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

angular.module('dashyAdmin').controller('AuthCtrl', ['$scope', '$timeout', 'AccessToken', 'AuthService', '$rootScope', '$location',
  function($scope, $timeout, AccessToken, AuthService, $rootScope, $location) {

    $rootScope.redirectUrl = redirectUrl;

    var isLoggedIn = false;

    $scope.$on('oauth:login', function() {
      $timeout(function() {
        console.log('logging in dashy 1');
        isLoggedIn = true;
        $location.path('/dashboards').replace();
        $rootScope.isDashyLoggingIn = true;
        AuthService.authenticateGoogleUser();
      }, 0);
    });

    $timeout(function() {
      if (!!AccessToken.get() && !isLoggedIn && $location.path() !== '/') {
        console.log('logging in dashy 2');
        $location.path('/dashboards').replace();
        $rootScope.isDashyLoggingIn = true;
        AuthService.authenticateGoogleUser();
      }
    }, 0);

    $scope.$on('oauth:loggedOut', function() {
      AuthService.logout();
    });


  }
]);
