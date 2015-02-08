'use strict';
angular.module('dashyAdmin').service('AuthService', ['$rootScope', 'Api', 'AccessToken', '$http', '$location', function($rootScope, Api, AccessToken, $http, $location) {

  var _this = this;

  _this.loginStatus = '';

  this.logout = function(){
    $rootScope.user = null;
    setStatus('logged_out');
  };

  this.authenticateGoogleUser = function() {

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
        $rootScope.user = _this.currentUser;
        $rootScope.$broadcast('dashy:dashboards', _this.user.id);
        $location.path('/dashboards').replace();
      })
      .error(function(data, status) {
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


}]);

angular.module('dashyAdmin').controller('AuthCtrl', ['$scope', '$timeout', 'AccessToken', 'AuthService', function($scope, $timeout, AccessToken, AuthService) {

  var isLogin;
  $scope.$on('oauth:login', function() {
    console.log('User authorized from Google');
    AuthService.authenticateGoogleUser();
    isLogin = true;
  });

  $timeout(function() {
    if (!!AccessToken.get() && !isLogin) {
      AuthService.authenticateGoogleUser();
    }
  }, 0);

  $scope.$on('oauth:loggedOut', function() {
    AuthService.logout();
  });


}]);
