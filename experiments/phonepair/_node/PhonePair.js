var express = require('express');
var http = require('http');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var interval = 100;

var connections = {};
var pulse = setInterval(onHeartBeat, interval);

server.listen('8080');

io.sockets.on('connection', function (socket) {
	
	socket.on('create-session', function() {

		var pair = new SocketPairing(socket);
		connections[pair.sessionName] = pair;
		socket.pair = pair;
		socket.controller = false;
		socket.emit('initial-state', {camera: pair.camera, id:pair.id, session: pair.session, paired: pair.connected});
	});

	socket.on('session-connect', function(data) {

		var pair = connections['s'+data.session];
		socket.controller = true;
		
		if(pair) {

			pair.controller = socket;
			pair.display.emit('connection-established');
			pair.controller.emit('connection-established');
			pair.connected = true;
			socket.pair = pair;
		}
		
	});

	socket.on('camera-move', function(data) {

		if(socket.pair)
		{
			socket.pair.camera.accelerometer.x = data.accelerometer.x;
			socket.pair.camera.accelerometer.y = data.accelerometer.y;
			socket.pair.camera.accelerometer.z = data.accelerometer.z;

			socket.pair.camera.gyroscope.alpha = data.gyroscope.alpha;
			socket.pair.camera.gyroscope.beta = data.gyroscope.beta;
			socket.pair.camera.gyroscope.gamma = data.gyroscope.gamma;

			socket.pair.camera.gyroscope.x = data.gyroscope.x;
			socket.pair.camera.gyroscope.y = data.gyroscope.y;
			socket.pair.camera.gyroscope.z = data.gyroscope.z;
		}

	});
	
	socket.on('disconnect', function () {

		if(socket.pair)
		{
			if(socket.controller)
			{
				clearController(socket.pair);
			}
			 else
			{
				clearSession(socket.pair);
			}
			
			socket.pair = null;
		}

	});

});

function onHeartBeat() {

	for(var p in connections)
	{
		var pair = connections[p];

		if(pair.connected)
		{
			pair.display.emit('camera-update', {camera: pair.camera});
		}
	}

}

function getSessionID() {

	var id = Math.round(Math.random() * 8999) + 1000;

	while(connections['s'+id])
	{
		id = Math.round(Math.random() * 8999) + 1000;
	}

	return id;
}

function clearSession(pair) {
	pair.display = null;
	pair.connected = false;

	if(pair.controller)
	{
		pair.controller.emit('display-disconnected');
		pair.controller.pair = null;
		pair.controller = null;
	}
	
	delete connections[pair.sessionName];
}

function clearController(pair) {
	pair.controller = null;
	pair.connected = false;
	
	if(pair.display)
	{
		pair.display.emit('controller-disconnected');
	}
}

var SocketPairing = function(socket) {

	var sesh = getSessionID();

	var p = {

		camera: {
			gyroscope: {
				alpha: 0,
				beta: 0, 
				gamma: 0,
				x: 0,
				y: 0,
				z: 0
			},
			accelerometer: {
				x: 0,
				y: 0,
				z: 0
			}
		},

		display: socket,
		connected: false,
		controller: null,
		id: socket.id,
		session: sesh,
		sessionName: 's'+sesh
	};

	return p;
}