var pomelo = window.pomelo;
var username;
var users;
var rid;
var base = 1000;
var increase = 25;
var reg = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
var LOGIN_ERROR = "There is no server to log in, please wait.";
var LENGTH_ERROR = "Name/Channel is too long or too short. 20 character max.";
var NAME_ERROR = "Bad character in Name/Channel. Can only have letters, numbers, Chinese characters, and '_'";
var DUPLICATE_ERROR = "Please change your name to login.";

util = {
	urlRE: /https?:\/\/([-\w\.]+)+(:\d+)?(\/([^\s]*(\?\S+)?)?)?/g,
	//  html sanitizer
	toStaticHTML: function(inputHtml) {
		inputHtml = inputHtml.toString();
		return inputHtml.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	},
	//pads n with zeros on the left,
	//digits is minimum length of output
	//zeroPad(3, 5); returns "005"
	//zeroPad(2, 500); returns "500"
	zeroPad: function(digits, n) {
		n = n.toString();
		while(n.length < digits)
		n = '0' + n;
		return n;
	},
	//it is almost 8 o'clock PM here
	//timeString(new Date); returns "19:49"
	timeString: function(date) {
		var minutes = date.getMinutes().toString();
		var hours = date.getHours().toString();
		return this.zeroPad(2, hours) + ":" + this.zeroPad(2, minutes);
	},

	//does the argument only contain whitespace?
	isBlank: function(text) {
		var blank = /^\s*$/;
		return(text.match(blank) !== null);
	}
};

//always view the most recent message when it is added
function scrollDown(base) {
	window.scrollTo(0, base);
	$("#entry").focus();
};

// add message on board
function addMessage(from, target, text, time) {
	var name = (target == '*' ? 'all' : target);
	if(text === null) return;
	if(time == null) {
		// if the time is null or undefined, use the current time.
		time = new Date();
	} else if((time instanceof Date) === false) {
		// if it's a timestamp, interpret it
		time = new Date(time);
	}
	//every message you see is actually a table with 3 cols:
	//  the time,
	//  the person who caused the event,
	//  and the content
	var messageElement = $(document.createElement("table"));
	messageElement.addClass("message");
	// sanitize
	text = util.toStaticHTML(text);
	var content = '<tr>' + '  <td class="date">' + util.timeString(time) + '</td>' + '  <td class="nick">' + util.toStaticHTML(from) + ' says to ' + name + ': ' + '</td>' + '  <td class="msg-text">' + text + '</td>' + '</tr>';
	messageElement.html(content);
	//the log is the stream that we view
	$("#chatHistory").append(messageElement);
	base += increase;
	scrollDown(base);
};

// update online users in select
function updateSelectUsers(data) {
	var selected = $("#usersList").val();
	users = data.users;
	$("#usersList option").each(
		function() {
			if($(this).val() != '*') $(this).remove();
	});
	for(var i = 0; i < users.length; i++) {
		var slElement = $(document.createElement("option"));
		slElement.attr("value", users[i]);
		slElement.text(users[i]);
		$("#usersList").append(slElement);
	}
	$("#usersList").attr("value", selected);
};

// set your name
function setName() {
	$("#name").text(username);
};

// set your room
function setRoom() {
	$("#room").text(rid);
};

// show error
function showError(content) {
	$("#loginError").text(content);
	$("#loginError").show();
};

// show login panel
function showLogin() {
	$("#loginView").show();
	$("#chatHistory").hide();
	$("#toolbar").hide();
	$("#loginError").hide();
	$("#loginUser").focus();
};

// show chat panel
function showChat() {
	$("#loginView").hide();
	$("#loginError").hide();
	$("#toolbar").show();
	$("entry").focus();
	scrollDown(base);
};

// query connector
function queryEntry(uid, callback) {
	var route = 'gate.gateHandler.queryEntry';
	pomelo.init({
		host: window.location.hostname,
		port: 3014,
		log: true
	}, function() {
		pomelo.request(route, {
			uid: uid
		}, function(data) {
			pomelo.disconnect();
			if(data.code === 500) {
				showError(LOGIN_ERROR);
				return;
			}
			callback(data.host, data.port);
		});
	});
};

$(document).ready(function() {
	//when first time into chat room.
	showLogin();

	//wait message from the server.
	pomelo.on('onChat', function(data) {
		addMessage(data.from, data.target, data.msg);
		$("#chatHistory").show();
	});

	//update user list
	pomelo.on('onUsers', function(data) {
		updateSelectUsers(data);
	});


	//handle disconect message, occours when the client is disconnect with servers
	pomelo.on('disconnect', function(reason) {
		showLogin();
	});

	//deal with login button click.
	$("#login").click(function() {
		username = $("#loginUser").attr("value");
		rid = $('#channelList').val();

		if(username.length > 20 || username.length == 0 || rid.length > 20 || rid.length == 0) {
			showError(LENGTH_ERROR);
			return false;
		}

		if(!reg.test(username) || !reg.test(rid)) {
			showError(NAME_ERROR);
			return false;
		}

		//query entry of connection
		queryEntry(username, function(host, port) {
			pomelo.init({
				host: host,
				port: port,
				log: true
			}, function() {
				var route = "connector.entryHandler.enter";
				pomelo.request(route, {
					username: username,
					rid: rid
				}, function(data) {
					if(data.error) {
						showError(DUPLICATE_ERROR);
						return;
					}
					setName();
					setRoom();
					showChat();
				});
			});
		});
	});

	//deal with chat mode.
	$("#entry").keypress(function(e) {
		var route = "chat.chatHandler.send";
		var target = $("#usersList").val();
		if(e.keyCode != 13 /* Return */ ) return;
		var msg = $("#entry").attr("value").replace("\n", "");
		if(!util.isBlank(msg)) {
			pomelo.request(route, {
				rid: rid,
				content: msg,
				from: username,
				target: target
			}, function(data) {
				$("#entry").attr("value", ""); // clear the entry field.
				if(target != '*' && target != username) {
					addMessage(username, target, msg);
					$("#chatHistory").show();
				}
			});
		}
	});
});