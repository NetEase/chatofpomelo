var exp = module.exports;
var dispatcher = require('./dispatcher');

exp.chat = function(session, msg, app, cb) {
	var chatServers = [
		{"id":"chat-server-1", "host":"127.0.0.1", "port":6050},
		{"id":"chat-server-2", "host":"127.0.0.1", "port":6051},
		{"id":"chat-server-3", "host":"127.0.0.1", "port":6052}
	];

	if(!chatServers || chatServers.length === 0) {
		cb(new Error('can not find chat servers.'));
		return;
	}
	var res = dispatcher.dispatch(session.get('rid'), chatServers);
	cb(null, res.id);
};