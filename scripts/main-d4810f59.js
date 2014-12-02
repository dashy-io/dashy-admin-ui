"use strict";$(".list-group-item").on("click",function(a){var t=$(this).closest(".list-group").children(".active");t.removeClass("active"),$(a.target).addClass("active")});var dashyAdmin=angular.module("dashyAdmin",["ngRoute"]);dashyAdmin.config(["$routeProvider","$locationProvider",function(a){a.when("/",{templateUrl:"main.html",controller:"MainCtrl",controllerAs:"main"}).when("/dashboards/:dashboardId",{templateUrl:"dashboard.html",controller:"DashboardCtrl",controllerAs:"dashboard"}).otherwise({redirectTo:"/"})}]),dashyAdmin.factory("api",["$http",function(a){return{getServerStatus:function(){return a.get("http://api.dashy.io/status")},getUserDashboards:function(t){var r=t;return r="cc1f2ba3-1a19-44f2-ae78-dc9784a2a60f",a.get("http://api.dashy.io/users/"+r)},newDashboard:function(){return a({method:"POST",headers:{"Content-Type":"application/json"},url:"http://api.dashy.io/dashboards/"})},getDashboard:function(t){return a.get("http://api.dashy.io/dashboards/"+t)},deleteDashboard:function(t){return a.delete("http://api.dashy.io/dashboards/"+t)},setDashboard:function(t){return a({method:"PUT",headers:{"Content-Type":"application/json"},data:{interval:t.interval,name:t.name,urls:t.urls},url:"http://api.dashy.io/dashboards/"+t.id})}}}]),dashyAdmin.controller("ServerStatusCtrl",["$scope","api",function(a,t){var r=t.getServerStatus();r.success(function(t,r){a.serverStatus=r}).error(function(){a.serverStatus=0}),a.newDashboard=function(){t.newDashboard().success(function(a,t){console.log(a),console.log(t)})}}]),dashyAdmin.controller("MainCtrl",["$scope","api",function(a,t){var r=t.getUserDashboards();r.success(function(r){r.dashboards.forEach(function(r){t.getDashboard(r).success(function(t){a.dashboards=[],a.dashboards.push(t)})})}).error(function(){a.dashboards=[],a.dashboardsError="Couldn't load your dashboards"}),a.deleteDashboard=function(a){window.confirm("Are you sure you want to delete your dashboard "+a.name)&&console.log("deleting "+a.id)}}]),dashyAdmin.controller("DashboardCtrl",["$scope","api","$routeParams","$timeout",function(a,t,r,o){t.getDashboard(r.dashboardId).success(function(t){a.dashboard=t}),a.addUrl=function(){a.dashboard.urls.push("insert url")},a.removeUrl=function(t){a.dashboard.urls.splice(t,1)},a.saveDashboard=function(a){$(".btn-save").button("loading"),$(".btn-save").prop("disabled",!0),t.setDashboard(a).success(function(){$(".btn-save").button("complete"),o(function(){$(".btn-save").button("reset")},1500)}).error(function(a){window.alert("error updating: "+a)})}}]);