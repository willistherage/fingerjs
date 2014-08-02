

var CameraController = function(motion) {

	var c = {

		//----------------------------------------
		// Variables
		//----------------------------------------

		socket: null,
		connected: false,
		motion: motion,

		//----------------------------------------
		// Public Methods
		//----------------------------------------

		init: function() {
			
			_.bindAll(this, 'destroy', 'onUpdate', 'onSocketConnection', 'addListeners', 'removeListeners', 'onInitialState', 'onDisconnect', 'onConnectionEstablished', 'onDisplayDisconnect');
			
			this.socket = io.connect('http://psyop.io:8080');
			this.socket.on('connect', this.onSocketConnection);
		},

		destroy: function() {

		},

		addListeners: function() {

			this.socket.addListener('initial-state', this.onInitialState);
			this.socket.addListener('connection-established', this.onConnectionEstablished);
			this.socket.addListener('display-disconnected', this.onDisplayDisconnect);
			this.socket.addListener('disconnect', this.onDisconnect);

			window.animationframe.addListener(this.onUpdate);

		},

		removeListeners: function() {

			this.socket.removeListener('initial-state', this.onInitialState);
			this.socket.removeListener('connection-established', this.onConnectionEstablished);
			this.socket.removeListener('display-disconnected', this.onDisplayDisconnect);
			this.socket.removeListener('disconnect', this.onDisconnect);

		},

		//----------------------------------------
		// Event Handlers
		//----------------------------------------

		onSocketConnection: function() {
			
			this.addListeners();

			var session = window.prompt("Enter Session ID", "");
			
			if (session != null && session != "")
			{
				var data = {session: session};
				this.socket.emit('session-connect', data);
			}
			
		},

		onInitialState: function(data) {
			console.log(data);
		},

		onUpdate: function() {
			var accelerometer = {
				x: this.motion.acceleration.x,
				y: this.motion.acceleration.y,
				z: this.motion.acceleration.z
			};

			var gyroscope = {
				alpha: this.motion.gyro.alpha,
				beta: this.motion.gyro.beta,
				gamma: this.motion.gyro.gamma,
				x: this.motion.gyro.x,
				y: this.motion.gyro.y,
				z: this.motion.gyro.z
			};

			this.socket.emit('camera-move', {accelerometer: accelerometer, gyroscope: gyroscope});
		},

		onConnectionEstablished: function () {
			this.connected = true;
		},

		onDisplayDisconnect: function () {
			console.log('connection to display lost');
		},

		onDisconnect: function() {

			this.removeListeners();

		}
	}

	c.init();

	return c;
}
