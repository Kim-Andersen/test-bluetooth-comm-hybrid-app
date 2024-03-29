// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'services'])

.run(function($ionicPlatform, BLE) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    BLE.initialize({popupError: true});
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })

  /*.state('app.list', {
    url: "/list",
    views: {
      'menuContent': {
        controller: 'ListCtrl',
        templateUrl: "templates/list.html"
      }
    }
  })*/

  .state('app.discover', {
    url: "/discover",
    views: {
      'menuContent': {
        controller: 'DiscoverCtrl',
        templateUrl: "templates/discover.html"
      }
    }
  })

  .state('app.device-details', {
    url: "/device?id",
    views: {
      'menuContent': {
        controller: 'UnpairedDeviceDetailsCtrl',
        templateUrl: "templates/unpaired-device-details.html"
      }
    }
  })
    
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/discover');
});
