'use strict';
/*jshint camelcase: false */
angular.module('dashyAdmin').service('LoginService', ['$rootScope','$timeout', '$http', '$window', function($rootScope, $timeout, $http, $window) {
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
                        console.log('here');
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
        if (authResult.signed_in) {
            _this.authStatus = authResult;
            authenticateGoogleUser();
        } else {
            setStatus('logged_out');
        }
    }

    function authenticateGoogleUser() {
        $http.post('/auth/google/login', {
                access_token: _this.authStatus.access_token
            })
            .success(function(data) {
                _this.token = data.token;
                console.log('loginGoogleUser() POST ~/auth/google/login success:', _this.token);
                if (_this.existingUser !== false) {
                    _this.existingUser = true;
                }
                $http.defaults.headers.common.Authorization = 'Bearer ' + _this.token;
                getUser();
            })
            .error(function(data, status) {
                if (status === 403) {
                    console.log('loginGoogleUser() POST ~/auth/google/login user not signed up:', data, status);
                    _this.existingUser = false;
                    signupGoogleUser();
                } else {
                    console.log('loginGoogleUser() POST ~/auth/google/login error:', data, status);
                    setStatus('logged_out');
                    _this.reset();
                }
            });
    }

    function signupGoogleUser() {
        $http.post('/auth/google/signup', {
                access_token: _this.authStatus.access_token
            })
            .success(function(data) {
                console.log('signupGoogleUser() POST ~/auth/google/signup success:', data);
                authenticateGoogleUser();
            })
            .error(function(data, status) {
                console.log('signupGoogleUser() POST ~/auth/google/signup error:', data, status);
                setStatus('logged_out');
                _this.reset();
            });
    }

    function getUser() {
        $http.get('/user')
            .success(function(data) {
                _this.user = data;
                console.log('getUser() GET ~/user success:', _this.user);
                setStatus('logged_in');
            })
            .error(function(data, status) {
                console.log('getUser() GET ~/user error:', data, status);
                setStatus('logged_out');
                _this.reset();
            });
    }

}]);