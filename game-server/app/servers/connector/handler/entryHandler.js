module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
		this.app = app;
		this.globalChannelService = app.get('globalChannelService');
};

var handler = Handler.prototype;

/**
 * New client entry chat server.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
handler.enter = function(msg, session, next) {
	var self = this;
	var rid = msg.rid;
	var uid = msg.username + '*' + rid;
	var sessionService = self.app.get('sessionService');

	var message = {
		route: 'onAdd',
		user: msg.username
	};

	//duplicate log in
	if( !! sessionService.getByUid(uid)) {
		next(null, {
			code: 500,
			error: true
		});
		return;
	}

	session.bind(uid);
	session.set('rid', rid);
	session.push('rid', function(err) {
		if(err) {
			console.error('set rid for session service failed! error is : %j', err.stack);
			return;
		}
	});
	session.on('closed', onUserLeave.bind(this, self.app));

	var users = [];

	sendMessage(self, 'onAdd', message, rid);

	this.globalChannelService.add(rid, uid, self.app.get('serverId'), function(err) {
		if(err) {
			console.error('add user %s into channel %s failed, error: %j', uid, rid, err);
			return;
		} else {
			self.globalChannelService.getMembersByChannelName('connector', rid, function(err, list) {
				for(var i =0, l = list.length; i<l; i++) {
					users.push(list[i].split('*')[0]);
				}
				next(null, {
					users: users
				});
			});
		}
	});

};

var sendMessage = function(self, route, msg, channelName) {
	self.globalChannelService.pushMessage('connector', route, msg, channelName, {isPush: true}, function(err, fails) {
		if(err) {
			console.error('send message to all users error: %j, and fail ids: %j', err, fails);
			return;
		}
	});
};

/**
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onUserLeave = function(app, session) {
	if(!session || !session.uid) {
		return;
	}
	var message = {
		route: 'onLeave',
		user: session.uid.split('*')[0]
	};
	var self = this;
	this.globalChannelService.leave(session.get('rid'), session.uid, app.get('serverId'), function(err) {
		if(err) {
			console.error('user %s leave failed, error %j: ', session.uid, err);
			return;
		}
		sendMessage(self, 'onLeave', message, session.get('rid'));
	});
};