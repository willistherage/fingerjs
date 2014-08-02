

var CameraSocket = function(stage) {

	var c = {

		//----------------------------------------
		// Variables
		//----------------------------------------

		socket: null,
		connected: false,
		stage: stage,

		//----------------------------------------
		// Public Methods
		//----------------------------------------

		init: function() {
			
			_.bindAll(this, 'destroy', 'onSocketConnection', 'addListeners', 'removeListeners', 'onInitialState', 'onDisconnect', 'onCameraUpdate', 'onConnectionEstablished', 'onControllerDisconnect');
			
			this.socket = io.connect('http://psyop.io:8080');
			this.socket.on('connect', this.onSocketConnection);
		},

		destroy: function() {

		},

		addListeners: function() {

			this.socket.addListener('initial-state', this.onInitialState);
			this.socket.addListener('camera-update', this.onCameraUpdate);
			this.socket.addListener('connection-established', this.onConnectionEstablished);
			this.socket.addListener('controller-disconnected', this.onControllerDisconnect);
			this.socket.addListener('disconnect', this.onDisconnect);

		},

		removeListeners: function() {

			this.socket.removeListener('initial-state', this.onInitialState);
			this.socket.removeListener('camera-update', this.onCameraUpdate);
			this.socket.removeListener('connection-established', this.onConnectionEstablished);
			this.socket.removeListener('controller-disconnected', this.onControllerDisconnect);
			this.socket.removeListener('disconnect', this.onDisconnect);

		},

		//----------------------------------------
		// Event Handlers
		//----------------------------------------

		onSocketConnection: function() {

			console.log('on socket connection');
			this.connected = true;

			this.addListeners();

			this.socket.emit('create-session');
			
		},

		onInitialState: function(data) {

			$('.session h1').html(data.session);

		},

		onCameraUpdate: function(data) {

			//this.stage.cameraPositionSmooth.target.x += Math.round(data.camera.accelerometer.x * 10);
			//this.stage.cameraPositionSmooth.target.y += Math.round(data.camera.accelerometer.z * 10);
			//this.stage.cameraPositionSmooth.target.z += data.camera.accelerometer.y * 10;
			this.stage.cameraRotationSmooth.target.x = MathUtils.DegreesToRadians * data.camera.gyroscope.gamma;
			this.stage.cameraRotationSmooth.target.y = -MathUtils.DegreesToRadians * data.camera.gyroscope.alpha;
			this.stage.cameraRotationSmooth.target.z = MathUtils.DegreesToRadians * data.camera.gyroscope.beta;
		},

		onConnectionEstablished: function() {
			this.stage.paired = true;
		},

		onControllerDisconnect: function() {
			this.stage.paired = false;
		},

		onDisconnect: function() {

			this.removeListeners();

		}
	}

	c.init();

	return c;
}
