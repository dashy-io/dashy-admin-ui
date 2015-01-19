"use strict";angular.module("dashyAdmin",["ui.router"]),angular.module("dashyAdmin").run(["$rootScope","$state","LoginService",function(o,e,t){o.$on("$stateChangeStart",function(o,n){n.authenticate&&"logged_in"!==t.loginStatus&&(e.go("login"),o.preventDefault())})}]),angular.module("dashyAdmin").controller("ServerStatusCtrl",["Api",function(o){var e=this,t=o.getServerStatus();t.success(function(o,t){e.status=t,$(".btn-newDevice").prop("disabled",!1)}).error(function(){e.status=0})}]),angular.module("dashyAdmin").controller("NewDeviceCtrl",["$rootScope","Api","LoginService",function(o,e,t){var n=this;n.shortCode=null,n.validateShortCode=null,n.user=null,o.$on("userLoggedIn",function(){n.user=t.currentUser}),n.newDevice=function(){null===n.shortCode||6!==n.shortCode.length?n.validateShortCode=!1:(n.validateShortCode=!0,$(".btn-connectDevice").button("loading"),e.newDevice(n.user.id,n.shortCode).success(function(o){$(".btn-connectDevice").button("reset"),$("#connectDevice").modal("hide"),n.shortCode="",n.validateShortCode=null,console.log(o)}).error(function(o){console.log(o)}))}}]),angular.module("dashyAdmin").controller("DashboardsListCtrl",["Api","LoginService",function(o,e){var t=this,n=o.getUserDashboards(e.currentUser.id);n.success(function(e){e.dashboards?(t.noDashboards=!1,t.dashboards=[],e.dashboards.forEach(function(e){o.getDashboard(e).success(function(o){t.dashboards.push(o)}).error(function(o){$.snackbar({content:'<i class="fa fa-3x fa-ban pull-left"></i>'+e+"<br>"+o.message,timeout:0})})})):(t.dashboards=[],t.noDashboards=!0)}).error(function(){t.dashboards=[],t.dashboardsError="Couldn't load your dashboards"}),t.deleteDashboard=function(o){window.confirm("Are you sure you want to delete your dashboard "+o.name)&&console.log("deleting "+o.id)}}]),angular.module("dashyAdmin").controller("DashboardCtrl",["$scope","Api","$stateParams",function(o,e,t){e.getDashboard(t.dashboardId).success(function(e){o.dashboard=e}),o.addUrl=function(){o.dashboard.urls?o.dashboard.urls.push(""):(o.dashboard.urls=[],o.dashboard.urls.push(""))},o.removeUrl=function(e){o.dashboard.urls.splice(e,1)},o.saveDashboard=function(o){$(".btn-save").button("loading"),$(".btn-save").prop("disabled",!0),e.setDashboard(o).success(function(){$.snackbar({content:"Your dashboard has been updated!"}),$(".btn-save").button("reset")}).error(function(o){window.alert("error updating: "+o)})}}]),angular.module("dashyAdmin").config(["$stateProvider","$urlRouterProvider",function(o,e){e.otherwise("/dashboards"),o.state("login",{url:"/login",views:{content:{templateUrl:"login.html"}},authenticate:!1}).state("dashboardsList",{url:"/dashboards",views:{content:{templateUrl:"dashboardList.html",controller:"DashboardsListCtrl",controllerAs:"DashboardList"}},authenticate:!0}).state("dashboardEdit",{url:"/dashboards/:dashboardId",views:{content:{templateUrl:"dashboardEdit.html",controller:"DashboardCtrl"}},authenticate:!0})}]),angular.module("dashyAdmin").factory("Api",["$http",function(o){return{getServerStatus:function(){return o.get("http://api.dashy.io/status")},getUserDashboards:function(e){return o.get("http://api.dashy.io/users/"+e)},newDevice:function(e,t){return o({method:"POST",headers:{"Content-Type":"application/json"},data:{code:t},url:"http://api.dashy.io/users/"+e+"/dashboards"})},getDashboard:function(e){return o.get("http://api.dashy.io/dashboards/"+e)},deleteDashboard:function(e){return o.delete("http://api.dashy.io/dashboards/"+e)},setDashboard:function(e){return o({method:"PUT",headers:{"Content-Type":"application/json"},data:{interval:e.interval,name:e.name,urls:e.urls},url:"http://api.dashy.io/dashboards/"+e.id})}}}]);var apiHost="http://api.dashy.io";hello.init({google:"955388086787-1llsm4tuo5tbn050f0huu37kc17j6rru.apps.googleusercontent.com"},{redirect_uri:"http://localhost:9000/"}),angular.module("dashyAdmin").controller("LoginCtrl",["$window","$rootScope","LoginService",function(o,e,t){var n=this;n.hideLogin=!0,e.$on("userLogout",function(){n.hideLogin=!1}),e.$on("userLoggedIn",function(){n.hideLogin=!0,n.user=t.currentUser}),n.logout=function(){t.logout()},this.login=function(){t.login()},o.hello.on("auth.login",function(e){console.log("im in"),console.log(e),o.hello(e.network).api("/me").then(function(o){console.log(o)}),t.authenticateGoogleUser(e.authResponse.access_token)}),this.logout=function(){t.logout()}}]),angular.module("dashyAdmin").service("LoginService",["$window","$http","$rootScope","$state",function(o,e,t,n){function s(o){i.loginStatus!==o&&(console.log("LoginService status: "+o),i.loginStatus=o)}function r(){e.get(apiHost+"/user").success(function(o){i.user=o,console.log("getUser() GET ~/api/user success:",i.user),s("logged_in"),i.currentUser={id:i.user.id,name:i.user.name,imageUrl:i.user.imageUrl},t.$emit("userLoggedIn"),n.go("dashboardsList")}).error(function(o,e){console.log("getUser() GET ~/api/user error:",o,e),s("logged_out"),i.reset()})}function a(){e.post(apiHost+"/auth/google/signup",{access_token:i.authStatus.access_token}).success(function(o){console.log("signupGoogleUser() POST ~/api/google/signup success:",o),this.authenticateGoogleUser()}).error(function(o,e){console.log("signupGoogleUser() POST ~/api/google/signup error:",o,e),i.reset()})}var i=this;i.loginStatus="",this.login=function(){o.hello("google").login()},this.logout=function(){o.hello("google").logout()},this.authenticateGoogleUser=function(o){e.post(apiHost+"/auth/google/login",{access_token:o}).success(function(o){i.token=o.token,console.log("loginGoogleUser() POST ~/api/google/authenticate success:",i.token),i.existingUser!==!1&&(i.existingUser=!0),e.defaults.headers.common.Authorization="Bearer "+i.token,r()}).error(function(o,e){403===e?(console.log("loginGoogleUser() POST ~/api/google/authenticate user not signed up:",o,e),i.existingUser=!1,a()):(console.log("loginGoogleUser() POST ~/api/google/authenticate error:",o,e),s("logged_out"))})}}]);