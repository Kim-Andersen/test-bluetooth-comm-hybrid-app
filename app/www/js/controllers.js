angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

/*.controller('ListCtrl', ['$scope', 'BLE', 
  function ($scope, BLE) {
    $scope.devices = BLE.connected;

    $scope.refresh = function(){
      $scope.refreshing = true;

      BLE.loadConnected()
        .finally(function(){
          $scope.refreshing = false;
        });
    };    
}])*/

.controller('DiscoverCtrl', ['$scope', 'BLE', '$ionicLoading', 
  function($scope, BLE, $ionicLoading) {

    $scope.refresh = function(){
      $scope.scanning = true;
      $scope.devices = [];

      var onComplete = function(devices){
        },
        onNotify = function(device){
          $scope.devices.push(device);
        },
        onError = function(reason){
          console.log('onError', reason);
        };

      BLE.scan({seconds: 10}).then(onComplete, onError, onNotify)
        .finally(function(){
          $scope.scanning = false;
        });
    };

    $scope.refresh();
}])

.controller('UnpairedDeviceDetailsCtrl', ['$scope', '$stateParams', 'BLE', 
  function($scope, $stateParams, BLE) {

    $scope.device = BLE.getDeviceById($stateParams['id']);
    console.log('device', JSON.stringify($scope.device));

    $scope.connect = function(){
      var onSuccess = function(param1, param2){
          console.log('connect success', JSON.stringify(param1), JSON.stringify(param2));
        },
        onError = function(error){

          console.log('connect failed', JSON.stringify(error));
        };

      BLE.connect($scope.device.id)
        .then(onSuccess, onError);
    };
}])

