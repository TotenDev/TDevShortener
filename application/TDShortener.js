//
// TDShortener.js — TDevShortener
// today is 7/10/12, it is now 5:26 PM
// created by TotenDev
// see LICENSE for details.
//

//Modules
var assert = require('assert');
var TDConfig = require('./TDConfig.js');
var Store = require('js_cache');
var MemoryCache = new Store();

//Asserts
assert.ok(TDConfig("database.host"),"TDShortener says: 'database.host' is a required value and is not specified on config file.");
assert.ok(TDConfig("database.port"),"TDShortener says: 'database.port' is a required value and is not specified on config file.");
assert.ok(TDConfig("database.user"),"TDShortener says: 'database.user' is a required value and is not specified on config file.");
assert.ok(TDConfig("database.password"),"TDShortener says: 'database.password' is a required value and is not specified on config file.");
assert.ok(TDConfig("database.database"),"TDShortener says: 'database.database' is a required value and is not specified on config file.");
assert.ok(TDConfig("database.table"),"TDShortener says: 'database.table' is a required value and is not specified on config file.");
assert.ok(TDConfig("rest.cache-state"),"TDShortener says: 'rest.cache-state' is a required value and is not specified on config file.");
(TDConfig("rest.cache-state")&&TDConfig("rest.cache-state")=="1" ? assert.ok(TDConfig("rest.cache-expires"),"TDShortener says: 'rest.cache-expires' is a required value when 'rest.cache-state' is 1 BUT it is not specified on config file.") : null);
//Enum log types 
exports.DEBUG = 2;
exports.NOTICE = 1;
exports.ERROR = 0;

//Shared instance
module.exports = new TDShortener();
//TDShortener Initializer
function TDShortener () {
//	this.type = 
}
//Main Methods
//short it
TDShortener.prototype.shortener = function (_url,callbackFunction) {
	var url = _url ;
	//isValid url
	if (!TDShortener.isValidURL(url)) {
		callbackFunction(false,"url is not valid ;(");
	}
	else {
		//Check if url is not bigger than database limit (255)
		if (url.length > 255) {
			callbackFunction(false,"url is bigger than limit");
		}
		//Continue
		else {
			//Check if have same url already stored
			TDShortener.containsURL(url,function (contains) {
				//Find it and return
				if (contains) { TDShortener.hashOfURL(url,function (have,hash) { callbackFunction(true,hash); }); }
				//Generate hash and insert into DB
				else { TDShortener.shortIt(url,function (hash) { callbackFunction(true,hash); }); }
			});
		}
	}
}
//un short it
TDShortener.prototype.unShortener = function (hash,callbackFunction) {
	TDShortener.URLOfHash(hash,callbackFunction);
}


//Public Helpers
//url with hashcode
TDShortener.prototype.formatToURL = function formatToURL(hash) {
	if (TDConfig("rest.port") == 80) { return "http://" + TDConfig("rest.host") + "/" + hash ; }
	else { return "http://" + TDConfig("rest.host") + ":" + TDConfig("rest.port") + "/" + hash ; }
}






//Helper
//Is Valid URL
TDShortener.isValidURL = function isValidURL(url) {
	var regexp = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
	return regexp.test(url);
}
//RandomHash
TDShortener.randomHash = function randomHash () {
	var chars = "0123456789QWERTYUIOPLKJHGFDSAZXCVBNMqwertyuioplkjhgfdsazxcvbnm";
	var string_length = 8;
	var randomstring = '';
	for (var i=0; i<string_length; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum,rnum+1);
	}
	return randomstring;
}





//DB
//Shortit until is okay and return hash
TDShortener.shortIt = function shortIt(url,callback) {
	var lastHash = TDShortener.randomHash();
	TDShortener.tryToInsert(url,lastHash,function (inserted) {
		if (inserted) { callback(lastHash); }
		else { TDShortener.shortIt(url,callback); }
	});
}
//Try to insert hash into db
TDShortener.tryToInsert = function tryToInsert(url,hashcode,callbackFunction){
	//Create socket
	var db = require("mysql-native").createTCPClient(TDConfig("database.host"),TDConfig("database.port")); // localhost:3306 by default
	db.auto_prepate = true;
	//auth
	db.auth(TDConfig("database.database"),TDConfig("database.user"),TDConfig("database.password"));
	//create query
	var queryStr = "INSERT INTO " + TDConfig("database.database") + "." + TDConfig("database.table") + " (url,hash) VALUES ('" + new Buffer(url).toString('base64') + "','" + hashcode + "');" ;
	//execute
	var cmd = db.query(queryStr);
	var responded = false;
	//inserted ok?
	cmd.addListener("error",function (t) {
		if (!responded) {
			responded = true;
			callbackFunction(false);
			db.terminate();
		}
	});
	cmd.addListener("end",function (t) {
		if (!responded) {
			responded = true;
			callbackFunction(true);
			db.terminate();
		}
	});
}
//Check in db if contains url
TDShortener.containsURL = function containsURL(url,callbackFunction){
	//Create socket
	var db = require("mysql-native").createTCPClient(TDConfig("database.host"),TDConfig("database.port")); // localhost:3306 by default
	db.auto_prepate = true;
	//auth
	db.auth(TDConfig("database.database"),TDConfig("database.user"),TDConfig("database.password"));
	//create query
	var queryStr = "SELECT * FROM " + TDConfig("database.database") + "." + TDConfig("database.table") + " WHERE url='" + new Buffer(url).toString('base64') + "';" ;
	//execute
	var cmd = db.query(queryStr);
	var responded = false;
	//contains url
	cmd.addListener("row",function (t) {
		if (!responded) {
			responded = true;
			callbackFunction(true);
			db.terminate();
		}
	});
	cmd.addListener("error",function (t) {
		if (!responded) {
			responded = true;
			callbackFunction(false);
			db.terminate();
		}
	});
	cmd.addListener("end",function (t) {
		if (!responded) {
			responded = true;
			callbackFunction(false);
			db.terminate();
		}
	});
}
//Return url if can of it hashcode
TDShortener.hashOfURL = function hashOfURL(url,callbackFunction){
	var baseURL = new Buffer(url).toString('base64');
	//Check for cache
	var cacheHash = MemoryCache.get(baseURL);
	if (TDConfig("rest.cache-state") == "1" && cacheHash && cacheHash.length > 0) { callbackFunction(true,cacheHash); }
	else {
		//Create socket
		var db = require("mysql-native").createTCPClient(TDConfig("database.host"),TDConfig("database.port")); // localhost:3306 by default
		db.auto_prepate = true;
		//auth
		db.auth(TDConfig("database.database"),TDConfig("database.user"),TDConfig("database.password"));
		//create query
		var queryStr = "SELECT * FROM " + TDConfig("database.database") + "." + TDConfig("database.table") + " WHERE url='" + baseURL + "';" ;
		//execute
		var cmd = db.query(queryStr);
		var responded = false;
		//contains url
		cmd.addListener("row",function (t) {
			if (!responded) {
				responded = true;
				callbackFunction(true,t["hash"]);
				//set cache
				if (TDConfig("rest.cache-state") == "1") { MemoryCache.set(baseURL,t["hash"],TDConfig("rest.cache-expires")); }
				//finish db
				db.terminate();
			}
		});
		cmd.addListener("error",function (t) {
			if (!responded) {
				responded = true;
				callbackFunction(false,null);
				db.terminate();
			}
		});
		cmd.addListener("end",function (t) {
			if (!responded) {
				responded = true;
				callbackFunction(false,null);
				db.terminate();
			}
		});	
	}
}
//Return url if can of it hashcode
TDShortener.URLOfHash = function URLOfHash(hash,callbackFunction){
	//Check for cache
	var cacheURL = MemoryCache.get(hash);
	if (TDConfig("rest.cache-state") == "1" && cacheURL && cacheURL.length > 0) { callbackFunction(true,cacheURL); }
	else {
		//Create socket
		var db = require("mysql-native").createTCPClient(TDConfig("database.host"),TDConfig("database.port")); // localhost:3306 by default
		db.auto_prepate = true;
		//auth
		db.auth(TDConfig("database.database"),TDConfig("database.user"),TDConfig("database.password"));
		//create query
		var queryStr = "SELECT * FROM " + TDConfig("database.database") + "." + TDConfig("database.table") + " WHERE hash='" + hash + "';" ;
		//execute
		var cmd = db.query(queryStr);
		var responded = false;
		//contains url
		cmd.addListener("row",function (t) {
			if (!responded) {
				var url = new Buffer(t["url"] || '', 'base64').toString('utf8');
				responded = true;
				//set cache
				if (TDConfig("rest.cache-state") == "1") { MemoryCache.set(hash,url,TDConfig("rest.cache-expires")); }
				//
				callbackFunction(true,url);
				db.terminate();
			}
		});
		cmd.addListener("error",function (t) {
			if (!responded) {
				responded = true;
				callbackFunction(false,null);
				db.terminate();
			}
		});
		cmd.addListener("end",function (t) {
			if (!responded) {
				responded = true;
				callbackFunction(false,null);
				db.terminate();
			}
		});
	}
}