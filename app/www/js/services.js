"use strict";

angular.module('services', [])

// https://github.com/don/cordova-plugin-ble-central
.factory('BLE', ['$q', '$timeout', '$ionicPopup',
	function ($q, $timeout, $ionicPopup) {
		var _isInitialized = false,
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

		function isEnabled(){
			var done = $q.defer(),
					onIsDisabled,
					onIsEnabled;

			onIsDisabled = function(){
				done.resolve(false);
	  	},

	  	onIsEnabled = function(){
	  		done.resolve(true);
	  	};

	  	ble.isEnabled(onIsEnabled, onIsDisabled);

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

	  function connect(id){
	  	var done = $q.defer(),
	  			connectSuccess,
	  			connectFailure;

	  	connectSuccess = function(a, b){
	  		done.resolve(a, b);
	  	};
	  	connectFailure = function(error){
	  		done.reject(error);

	  		$ionicPopup.alert({
		     title: 'Error',
		     template: MESSAGE.FAILED_TO_CONNECT
		   	});
	  	};

	  	// id: UUID or MAC address of the peripheral.
	  	ble.connect(id, connectSuccess, connectFailure);

	  	return done.promise;
	  }

	  /*function requireIsEnabled(fn){
	  	return function(){
	  		if(window.ble) {
		  		var _this = this,
			  			_arguments = arguments;

			  	return isEnabled().then(function(_isEnabled){
			  		if(isEnabled){
			  			return fn.apply(_this, _arguments);	
			  		}
			  		else {
			  			return $q.reject('Bluetooth is not enabled.');

			  			$ionicPopup.alert({
					     title: 'Error',
					     template: 'Bluetooth is disabled on your device. Please enable it.'
					   	});	
			  		}
			  	});	
		  	}
		  	else {
		  		return $q.reject('Bluetooth is not enabled.');
		  	}
	  	};
		};*/

		return {
			initialize: initialize,
			scan: scan,
			getDeviceById: getDeviceById,
			connect: connect
		};
}])

/*
.factory('BluetoothService', ['$q', '$ionicLoading', '$ionicPopup', '$timeout',
	function ($q, $ionicLoading, $ionicPopup, $timeout) {
	var isInitialized = false,
			unpaired = [],
			plugin,
			MESSAGE = {
				PLUGIN_NOT_FOUND: '"Bluetooth Serial" plugin not found.',
				BLUETOOTH_NOT_ENABLED: 'Bluetooth is not enabled.',
				SCANNING_UNPAIRED: 'Scanning...',
				DISCOVERY_FAILED: 'An error occured while scanning.',
				FAILED_TO_CONNECT: 'Failed to connect to device.'
			};

	function initialize(options){
  	var opt = angular.extend({}, options),
  			isEnabled,
  			notEnabled;

  	plugin = window.bluetoothSerial;

  	if(angular.isObject(plugin)){
  		notEnabled = function(){
	  		if(opt.popupError){
	  			$ionicPopup.alert({
			     title: 'Error',
			     template: MESSAGE.BLUETOOTH_NOT_ENABLED
			   	});
	  		}
	  	},

	  	isEnabled = function(){
	  		isInitialized = true;
	  	};

	  	plugin.isEnabled(
	        isEnabled,
	        notEnabled
	    );
  	}
  	else {
  		if(opt.popupError){
  			$ionicPopup.alert({
		     title: 'Error',
		     template: MESSAGE.PLUGIN_NOT_FOUND
		   	});	
  		}
  	}
  }

  function refreshUnpaired(options){
  	var opt = angular.extend({}, options);
  	var done = $q.defer();

  	if(!isInitialized){
  		return $q.reject(MESSAGE.PLUGIN_NOT_FOUND);
  	}

  	if(opt.showLoading){
  		$ionicLoading.show({
	      template: MESSAGE.SCANNING_UNPAIRED
	    });	
  	}
  	
  	plugin.list(function(devices){
  		unpaired = devices;
  		done.resolve(unpaired);
  		$ionicLoading.hide();
  	}, function(error){
  		if(opt.popupError){
  			$ionicPopup.alert({
		     title: 'Error',
		     template: 'Error trying to discover unpaired devices.'
		   });
  		}
  		console.log('Error trying to discover unpaired devices.', error);
  		done.reject('Error trying to discover unpaired devices.');
  		$ionicLoading.hide();
  	});

  	return done.promise;
  }

  // https://github.com/don/cordova-plugin-ble-central
  function scan(options){
  	var opt = angular.extend({seconds: 10}, options),
  			done = $q.defer(),
  			onDeviceDiscovered,
  			onError;

  	onDeviceDiscovered = function(device){
  		console.log('onDeviceDiscovered:', device);
  		unpaired.push(device);
  		done.notify(device);
  	};
  	onError = function(error){
  		console.log('onError:', error);
  		done.reject(MESSAGE.DISCOVERY_FAILED);
  	};

  	unpaired = [];

  	ble.scan([], opt.seconds, onDeviceDiscovered, onError);

  	$timeout(function(){
  		done.resolve(unpaired);
  	}, opt.seconds*1000);

  	return done.promise;
  }

  function getDeviceById(id){
  	var device;
  	angular.forEach(unpaired, function(d){
  		if(d.id == id){
  			device = d;
  		}
  	});
  	return device;
  }

  function connect(id){
  	var done = $q.defer(),
  			connectSuccess,
  			connectFailure;

  	connectSuccess = function(a, b){
  		done.resolve(a, b);
  	};
  	connectFailure = function(error){
  		done.reject(error);
  		$ionicPopup.alert({
	     title: 'Error',
	     template: MESSAGE.FAILED_TO_CONNECT
	   	});
  	};

  	// id: UUID or MAC address of the peripheral.
  	ble.connect(id, connectSuccess, connectFailure);

  	return done.promise;
  }

	return {
		initialize: initialize,
		unpaired: unpaired,
		refreshUnpaired: refreshUnpaired,
		scan: scan,
		getDeviceById: getDeviceById,
		connect: connect
	};
}])
*/