var pomelo = require('pomelo');
var zmq = require('pomelo-rpc-zeromq');
var routeUtil = require('./app/util/routeUtil');

/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'chatofpomelo');


// app configure
app.configure('production|development', function() {
	// route configures
	app.route('chat', routeUtil.chat);

	// filter configures
	app.filter(pomelo.timeout());

	app.set('proxyConfig', {
		rpcClient: zmq.client
	});

	app.set('remoteConfig', {
		rpcServer: zmq.server
	});

});

// start app
app.start();

process.on('uncaughtException', function(err) {
	console.error(' Caught exception: ' + err.stack);
});