module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
};

var handler = Handler.prototype;

/**
 * Send messages to users
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
handler.send = function(msg, session, next) {
	var rid = session.get('rid');
	var route = 'onChat';
	var username = session.uid.split('*')[0];

	var globalChannelService = this.app.get('globalChannelService');
	var statusService = this.app.get('statusService');

	var param = {
		route: route,
		msg: msg.content,
		from: username,
		target: msg.target
	};

	//the target is all users
	if(msg.target == '*') {
		globalChannelService.pushMessage('connector', route, param, rid, {isPush: true}, function(err, fails) {
			if(err) {
				console.error('send message to all users error: %j, fail ids: %j', err, fails);
				return;
			}
			next(null, {
				route: msg.route
			});
		});
	}
	//the target is specific user
	else {
		var uid = msg.target + '*' + rid;
		var uids = [uid];
		statusService.pushByUids(uids, route, param, function(err) {
			if(err) {
				console.error('send message to user %s failed, error: %j', uid, err);
				return;
			}
			next(null, {
				route: msg.route
			});
		});
	}
	
};