'use strict';
// config the routes
dashyAdmin.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/dashboards');
    $stateProvider
        .state('login', {
            url: '/login',
            views: {
                'content': {
                    templateUrl: 'login.html',
                    controller: 'LoginCtrl'
                }
            },
            authenticate: false
        })
        .state('dashboardsList', {
            url: '/dashboards',
            views: {
                'content': {
                    templateUrl: 'dashboardList.html',
                    controller: 'MainCtrl'
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

// check if user is logged in on every route
dashyAdmin.run(['$rootScope', '$state', 'authService', function($rootScope, $state, authService) {

    $rootScope.$on('$stateChangeStart',
        function(event, toState) {
            if (toState.authenticate && !authService.isLoggedIn()) {
                $state.go('login');
                event.preventDefault();
            }

        });

}]);