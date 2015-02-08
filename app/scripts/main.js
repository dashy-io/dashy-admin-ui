'use strict';

var app = angular.module('dashyAdmin', ['ngMaterial', 'ngRoute', 'oauth']);

app.config(['$locationProvider', function($locationProvider) {
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  }).hashPrefix('!');
}]);

// check if user is logged in on every route
// app.run(['$rootScope', '$state', 'AccessToken', function($rootScope, $state, AccessToken) {

//   $rootScope.$on('$stateChangeStart',
//     function(event, toState) {
//       if (toState.authenticate && !!AccessToken.get()) {
//         $state.go('login');
//         event.preventDefault();
//       }
//     });

// }]);

app.controller('HeaderCtrl', ['$scope', '$timeout', 'AccessToken', function($scope, $timeout, AccessToken) {

  $scope.$on('oauth:profile', function(e, profile) {
    $scope.userImg = profile.image.url;
  });
  $scope.$on('oauth:authorized', function() {
    $scope.logged = !!AccessToken.get();
    console.log($scope.logged);

  });
  $scope.$on('oauth:logout', function() {
    $scope.logged = !!AccessToken.get();
    console.log($scope.logged);
  });
}]);

app.controller('LoaderCtrl', ['$scope', function($scope) {
  $scope.$on('oauth:login', function() {
    $('.loader').removeClass('hidden');
  });
}]);




// // check the server status
// app.controller('NewDeviceCtrl', ['$rootScope', 'Api', 'LoginService', function($rootScope, Api, LoginService) {

//     // OrQyug temp code

//     var _this = this;

//     _this.shortCode = null;
//     _this.validateShortCode = null;
//     _this.user = null;


//     $rootScope.$on('userLoggedIn', function() {
//         _this.user = LoginService.currentUser;
//     });

//     // TODO finish _this
//     _this.newDevice = function() {

//         if (_this.shortCode === null || _this.shortCode.length !== 6) {

//             _this.validateShortCode = false;

//         } else {

//             _this.validateShortCode = true;

//             $('.btn-connectDevice').button('loading');

//             Api.newDevice(_this.user.id, _this.shortCode).success(function(data) {
//                 // reset the button
//                 $('.btn-connectDevice').button('reset');

//                 // close modal
//                 $('#connectDevice').modal('hide');

//                 // reset field
//                 _this.shortCode = '';
//                 _this.validateShortCode = null;

//                 console.log(data);
//             }).error(function(err) {
//                 console.log(err);
//             });

//         }
//     };

// }]);

// // retrieve user's dashboards and update them
// app.controller('DashboardsListCtrl', ['Api', 'LoginService', function(Api, LoginService) {

//     var _this = this;

//     // fetch the dashboards for the current user
//     var dashboardsIds = Api.getUserDashboards(LoginService.currentUser.id);

//     dashboardsIds.success(function(data) {
//         if (data.dashboards) {
//             _this.noDashboards = false;
//             _this.dashboards = [];
//             data.dashboards.forEach(function(e) {
//                 // e is the dashboard ID
//                 Api.getDashboard(e).success(function(data) {
//                     _this.dashboards.push(data);
//                 }).error(function(data) {
//                     $.snackbar({
//                         content: '<i class="fa fa-3x fa-ban pull-left"></i>' + e + '<br>' + data.message,
//                         timeout: 0
//                     });
//                 });
//             });
//         } else {
//             _this.dashboards = [];
//             _this.noDashboards = true;
//         }
//     }).error(function() {
//         _this.dashboards = [];
//         _this.dashboardsError = 'Couldn\'t load your dashboards';
//     });

//     _this.deleteDashboard = function(dashboard) {
//         if (window.confirm('Are you sure you want to delete your dashboard ' + dashboard.name)) {
//             console.log('deleting ' + dashboard.id);
//             // Api.deleteDashboard(id);
//         }
//     };

// }]);

// // view and update a dashboard
// app.controller('DashboardCtrl', ['$scope', 'Api', '$stateParams', function($scope, Api, $stateParams) {

//     // fetch the current dashboards
//     Api.getDashboard($stateParams.dashboardId).success(function(data) {
//         $scope.dashboard = data;
//     });

//     // add another url
//     $scope.addUrl = function() {
//         if ($scope.dashboard.urls) {
//             $scope.dashboard.urls.push('');
//         } else {
//             $scope.dashboard.urls = [];
//             $scope.dashboard.urls.push('');
//         }
//     };

//     // remove an url
//     $scope.removeUrl = function(url) {
//         $scope.dashboard.urls.splice(url, 1);
//     };

//     // update/save a dashboard
//     $scope.saveDashboard = function(dashboard) {
//         $('.btn-save').button('loading');
//         $('.btn-save').prop('disabled', true);
//         Api.setDashboard(dashboard).success(function() {
//             $.snackbar({
//                 content: 'Your dashboard has been updated!'
//             });
//             $('.btn-save').button('reset');
//         }).error(function(error) {
//             // TODO tell the user that there was an error updating
//             window.alert('error updating: ' + error);
//         });
//     };

// }]);
