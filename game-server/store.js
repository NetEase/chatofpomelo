var redis = require('redis');

var StoreManager = function() {
  this.redis = redis.createClient(6379, '127.0.0.1', {});
};

module.exports = new StoreManager();

StoreManager.prototype.add = function(key, value, cb) {
  this.redis.sadd(key, value, function(err) {
    cb(err);
  });
};

StoreManager.prototype.remove = function(key, value, cb) {
  this.redis.srem(key, value, function(err) {
  	cb(err);
  });
};

StoreManager.prototype.load = function(key, cb) {
	this.redis.smembers(key, function(err, list) {
		cb(err, list);
	});
};

StoreManager.prototype.removeAll = function(key, cb) {
  this.redis.del(key, function(err) {
    cb(err);
  });
};