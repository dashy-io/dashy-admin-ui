/* global describe, it */

(function() {
    'use strict';

    describe('Unit: Testing Controllers', function() {

        beforeEach(module('dashyAdmin'));

        it('should have a ServerStatusCtrl controller', function() {
            expect(dashyAdmin.ServerStatusCtrl).not.to.equal(null);
        });

        it('should have a MainCtrl controller', function() {
            expect(dashyAdmin.MainCtrl).not.to.equal(null);
        });

        it('should have a DashboardCtrl controller', function() {
            expect(dashyAdmin.DashboardCtrl).not.to.equal(null);
        });
    });

    describe('Unit: ServerStatusCtrl', function() {

        it('should have a properly working ServerStatus controller', inject(function($rootScope, $controller, $httpBackend) {


            var response = $httpBackend.expectGET(
                'http://api.dashy.io/status');

            var $scope = $rootScope.$new();
            var ctrl = $controller('ServerStatusCtrl', {
                $scope: $scope
            });

            expect($scope.serverStatus).to.be.equal(200);

        }));

    });

})();
