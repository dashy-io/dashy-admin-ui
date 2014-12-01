"use strict";$(".list-group-item").on("click",function(a){var o=$(this).closest(".list-group").children(".active");o.removeClass("active"),$(a.target).addClass("active")});var dashyAdmin=angular.module("dashyAdmin",["ngRoute"]);dashyAdmin.config(["$routeProvider","$locationProvider",function(a){a.when("/",{templateUrl:"main.html",controller:"MainCtrl",controllerAs:"main"}).when("/dashboards/:dashboardId",{templateUrl:"dashboard.html",controller:"DashboardCtrl",controllerAs:"dashboard"}).otherwise({redirectTo:"/"})}]),dashyAdmin.factory("api",["$http",function(a){return{getServerStatus:function(){return a.get("http://api.dashy.io/status")},getUserDashboards:function(o){var r=o;return r="cc1f2ba3-1a19-44f2-ae78-dc9784a2a60f",a.get("http://api.dashy.io/users/"+r)},newDashboard:function(){return a({method:"POST",headers:{"Content-Type":"application/json"},url:"http://api.dashy.io/dashboards/"})},getDashboard:function(o){return a.get("http://api.dashy.io/dashboards/"+o)},deleteDashboard:function(o){return a.delete("http://api.dashy.io/dashboards/"+o)},setDashboard:function(o){return a({method:"PUT",headers:{"Content-Type":"application/json","Access-Control-Allow-Methods":"GET, POST, PUT, OPTIONS"},data:{interval:o.interval,name:o.name,urls:o.urls},url:"http://api.dashy.io/dashboards/"+o.id})}}}]),dashyAdmin.controller("ServerStatusCtrl",["$scope","api",function(a,o){var r=o.getServerStatus();r.success(function(o,r){a.serverStatus=r}).error(function(){a.serverStatus=0}),a.newDashboard=function(){o.newDashboard().success(function(a,o){console.log(a),console.log(o)})}}]),dashyAdmin.controller("MainCtrl",["$scope","api",function(a,o){var r=o.getUserDashboards();r.success(function(r){r.dashboards.forEach(function(r){o.getDashboard(r).success(function(o){a.dashboards=[],a.dashboards.push(o)})})}).error(function(){a.dashboards=[],a.dashboardsError="Couldn't load your dashboards"}),a.deleteDashboard=function(a){window.confirm("Are you sure you want to delete your dashboard "+a.name)&&console.log("deleting "+a.id)}}]),dashyAdmin.controller("DashboardCtrl",["$scope","api","$routeParams",function(a,o,r){o.getDashboard(r.dashboardId).success(function(o){a.dashboard=o}),a.addUrl=function(){a.dashboard.urls.push("")},a.removeUrl=function(o){a.dashboard.urls.splice(o,1)},a.saveDashboard=function(a){o.setDashboard(a).success(function(a,o){console.log(o)}).error(function(a){console.log("error updating: "+a)})}}]);