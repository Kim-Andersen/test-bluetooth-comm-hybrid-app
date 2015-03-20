"use strict";

angular.module('services', [])

// https://github.com/don/cordova-plugin-ble-central
.factory('BLE', ['$q', '$timeout', '$ionicPopup', '$ionicLoading',
	function ($q, $timeout, $ionicPopup, $ionicLoading) {
		var _isInitialized = false,
				_connected = [],
				_lastscan = [];

		function initialize(){
			if(window.ble) {
				return isEnabled().then(function(_isEnabled){
		  		if(!isEnabled){
		  			$ionicPopup.alert({
				     title: 'Error',
				     template: 'Bluetooth is disabled on your device. Please enable it.'
				   	});	
		  		}

		  		_isInitialized = true;
		  	});
			}			
		}

		/*
			Function isEnabled calls the success callback when Bluetooth is enabled and the failure callback when Bluetooth is not enabled.
		*/
		function isEnabled(id){
	  	var done = $q.defer();

	  	// https://github.com/don/cordova-plugin-ble-central#isenabled
	  	ble.isEnabled(
	  		id, 
	  		function(){
	  			done.resolve(true);
	  		}, 
	  		function(){
	  			done.resolve(false);
	  		}
	  	);

	  	return done.promise;
	  }
	
		function scan(options){		
			var opt = angular.extend({seconds: 10}, options),
	  			done = $q.defer(),
	  			onDeviceDiscovered,
	  			onError;

	  	_lastscan = [];

	  	onDeviceDiscovered = function(device){
	  		_lastscan.push(device);
	  		done.notify(device);	  		
	  		console.log('BLE.scan.onDeviceDiscovered:', device);	  		
	  	};

	  	onError = function(error){
	  		done.reject('Error while scanning.');
	  		console.log('BLE.scan.onError:', error);
	  	};

	  	// https://github.com/don/cordova-plugin-ble-central#scan
	  	window.ble && ble.scan([], opt.seconds, onDeviceDiscovered, onError);


	  	$timeout(function(){
	  		done.resolve(_lastscan);
	  	}, opt.seconds*1000);

	  	return done.promise; 	
	  }

	  function getDeviceById(id){
	  	var device;
	  	angular.forEach(_lastscan, function(d){
	  		if(d.id == id){
	  			device = d;
	  		}
	  	});
	  	return device;
	  }

	  // param <id>: UUID or MAC address of the peripheral.
	  function connect(id){
	  	var done = $q.defer(),
	  			connectSuccess,
	  			connectFailure;

	  	connectSuccess = function(info){
	  		console.log('BLE.connect.connectSuccess', JSON.stringify(info));
	  		done.resolve(info);
	  	};
	  	connectFailure = function(error){
	  		console.log('BLE.connect.connectFailure', JSON.stringify(error));
	  		done.reject(error);

	  		$ionicPopup.alert({
		     title: 'Error',
		     template: 'Failed to connect to device.'
		   	});
	  	};

	  	$ionicLoading.show({
	  		template: 'Connecting...'
	  	});

	  	done.promise.finally(function(){
	  		$ionicLoading.hide();
	  	});

	  	ble.connect(id, connectSuccess, connectFailure);

	  	return done.promise;
	  }

	  /*
	  	https://github.com/don/cordova-plugin-ble-central#isconnected
	  	Function isConnected calls the success callback when the peripheral is connected and the failure callback when not connected.
	  */
	  function isConnected(id){
	  	var done = $q.defer();

	  	// id: UUID or MAC address of the peripheral.
	  	ble.connect(
	  		id, 
	  		function(){
	  			done.resolve(true);
	  		}, 
	  		function(){
	  			done.resolve(false);
	  		}
	  	);

	  	return done.promise;
	  }

	  
		return {
			initialize: initialize,
			scan: scan,
			getDeviceById: getDeviceById,
			connect: connect,
		};
}])