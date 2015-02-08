'use strict';
// config the routes
// angular.module('dashyAdmin').config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
//     $urlRouterProvider.otherwise('/');
//     $stateProvider
//         .state('login', {
//             url: '/login',
//             views: {
//                 'content':{
//                     templateUrl:'login.html',
//                     controller: 'LoginCtrl',
//                     controllerAs: 'Auth'
//                 }
//             },
//             authenticate: false
//         })
//         .state('dashboardsList', {
//             url: '/dashboards',
//             views: {
//                 'content': {
//                     templateUrl: 'dashboardList.html',
//                     controller: 'DashboardsListCtrl',
//                     controllerAs: 'DashboardList'
//                 }
//             },
//             authenticate: true
//         })
//         .state('dashboardEdit', {
//             url: '/dashboards/:dashboardId',
//             views: {
//                 'content': {
//                     templateUrl: 'dashboardEdit.html',
//                     controller: 'DashboardCtrl'
//                 }
//             },
//             authenticate: true
//         });
// }]);