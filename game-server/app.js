var pomelo = require('pomelo');
var routeUtil = require('./app/util/routeUtil');
var globalChannel = require('pomelo-globalchannel-plugin');
var status = require('pomelo-status-plugin');

/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'chatofpomelo');

// app configure
app.configure('production|development', function() {
	app.use(globalChannel, {
		globalChannel: {
			prefix: 'globalChannel',
			host: '127.0.0.1',
			port: 6379
		}	
	});

	app.use(status, {
		status: {
		prefix: 'status',
		host: '127.0.0.1',
		port: 6379
		}
	});

	// route configures
	app.route('chat', routeUtil.chat);

	// filter configures
	app.filter(pomelo.timeout());
});

// start app
app.start();

process.on('uncaughtException', function(err) {
	console.error(' Caught exception: ' + err.stack);
});