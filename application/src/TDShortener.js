//
// TDShortener.js — TDevShortener
// today is 7/10/12, it is now 5:26 PM
// created by TotenDev
// see LICENSE for details.
//

//Modules
var assert = require('assert');
var TDConfig = require('./TDConfig.js')();
var Store = require('js_cache');
var MemoryCache = new Store();

//Asserts
assert.ok(TDConfig.getValue("database.host"),"** TDShortener ** 'database.host' enviroment variable is a required value and is not specified.");
assert.ok(TDConfig.getValue("database.port"),"** TDShortener ** 'database.port' enviroment variable is a required value and is not specified.");
assert.ok(TDConfig.getValue("database.user"),"** TDShortener ** 'database.user' enviroment variable is a required value and is not specified.");

assert.ok(TDConfig.getValue("database.database"),"** TDShortener ** 'database.database' enviroment variable is a required value and is not specified.");
assert.ok(TDConfig.getValue("database.table"),"** TDShortener ** 'database.table' enviroment variable is a required value and is not specified.");
assert.ok(TDConfig.getValue("shortener.acceptedURLS"),"** TDShortener ** 'shortener.acceptedURLS' enviroment variable is a required value and is not specified.");
assert.ok(TDConfig.getValue("rest.cache-state"),"** TDShortener ** 'rest.cache-state' enviroment variable is a required value and is not specified.");
(TDConfig.getValue("rest.cache-state")&&TDConfig.getValue("rest.cache-state")=="1" ? assert.ok(TDConfig.getValue("rest.cache-expires"),"** TDShortener ** 'rest.cache-expires' is a required value when 'rest.cache-state' is activated(1) BUT it is not specified.") : null);

//Shared instance
module.exports = new TDShortener();
//TDShortener Initializer
function TDShortener () {}
//Main Methods
TDShortener.prototype.shortener = function (_url,callbackFunction) {
	var url = _url ;
	//isValid url
	if (!TDShortener.isValidURL(url)) { callbackFunction(false,"url does not complain to shortener rules ;("); }
	else {
      //Check if have same url already stored
      TDShortener.dbContainsURL(url,function (contains) {
        //Find it and return
        if (contains) { TDShortener.dbHashOfURL(url,function (have,hash) { callbackFunction(true,hash); }); }
        //Generate hash and insert into DB
        else { TDShortener.shortIt(url,function (hash) { callbackFunction(true,hash); }); }
      });
	}
}
//un short it
TDShortener.prototype.unShortener = function (hash,callbackFunction) {
	TDShortener.dbURLOfHash(hash,callbackFunction);
}
//url with hashcode
TDShortener.prototype.formatToURL = function formatToURL(hash) {
	if (TDConfig.getValue("rest.port") == 80 || TDConfig.getValue("rest.port") != (process.env.PORT || TDConfig.getValue("rest.port"))) { return "http://" + TDConfig.getValue("rest.host") + "/" + hash ; }
	else { return "http://" + TDConfig.getValue("rest.host") + ":" + TDConfig.getValue("rest.port") + "/" + hash ; }
}






//Helper
//Is Valid URL
TDShortener.isValidURL = function isValidURL(url) {
	var acceptedURLSRegex = eval(TDConfig.getValue("shortener.acceptedURLS"));
	for (var regexIDX in acceptedURLSRegex) {
		var regexObj = new RegExp(acceptedURLSRegex[regexIDX],"gi");
       if (regexObj.test(url)) return true;
	} return false;
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
//Shortit until is okay and return hash
TDShortener.shortIt = function shortIt(url,callback) {
	var lastHash = TDShortener.randomHash();
	TDShortener.dbTryToInsert(url,lastHash,function (inserted) {
		if (inserted) { callback(lastHash); }
		else { TDShortener.shortIt(url,callback); }
	});
}

//DB
//Try to insert hash into db
TDShortener.dbTryToInsert = function dbTryToInsert(url,hashcode,callbackFunction){
	//Create connection
	var db = TDShortener.databaseConnection();
	//create query
	var queryStr = "INSERT INTO " + TDConfig.getValue("database.database") + "." + TDConfig.getValue("database.table") + " (url,hash) VALUES ('" + new Buffer(url).toString('base64') + "','" + hashcode + "');" ;
	//execute
	var cmd = db.query(queryStr);
	var responded = false;
	//inserted ok?
	cmd.addListener("error",function (t) {
		console.log("error in query " + t);
		if (!responded) { responded = true; callbackFunction(false); db.terminate(); }
	});
	cmd.addListener("end",function (t) {
		if (!responded) { responded = true; callbackFunction(true); db.terminate(); }
	});
}
//Check in db if contains url
TDShortener.dbContainsURL = function dbContainsURL(url,callbackFunction){
	//Create connection
	var db = TDShortener.databaseConnection();
	//create query
	var queryStr = "SELECT * FROM " + TDConfig.getValue("database.database") + "." + TDConfig.getValue("database.table") + " WHERE url='" + new Buffer(url).toString('base64') + "';" ;
	//execute
	var cmd = db.query(queryStr);
	var responded = false;
	//contains url
	cmd.addListener("row",function (t) {
		if (!responded) { responded = true; callbackFunction(true); db.terminate(); }
	});
	cmd.addListener("error",function (t) {
		console.log("error in query " + t);
		if (!responded) { responded = true; callbackFunction(false); db.terminate(); }
	});
	cmd.addListener("end",function (t) {
		if (!responded) { responded = true; callbackFunction(false); db.terminate(); }
	});
}
//Return Hash of URL
TDShortener.dbHashOfURL = function dbHashOfURL(url,callbackFunction){
	var baseURL = new Buffer(url).toString('base64');
	//Check for cache
	var cacheHash = MemoryCache.get(baseURL);
	if (TDConfig.getValue("rest.cache-state") == "1" && cacheHash && cacheHash.length > 0) { callbackFunction(true,cacheHash); }
	else {
		//Create socket
		var db = TDShortener.databaseConnection();
		//create query
		var queryStr = "SELECT * FROM " + TDConfig.getValue("database.database") + "." + TDConfig.getValue("database.table") + " WHERE url='" + baseURL + "';" ;
		//execute
		var cmd = db.query(queryStr);
		var responded = false;
		//contains url
		cmd.addListener("row",function (t) {
			if (!responded) {
				responded = true;
				callbackFunction(true,t["hash"]);
				//set cache
				if (TDConfig.getValue("rest.cache-state") == "1") { 
					if (MemoryCache.size() > TDConfig.getValue("rest.cache-rows-limit")) { console.log("In-Mem cache overflow. Cleaning!"); MemoryCache.clear(); }
					MemoryCache.set(baseURL,t["hash"],TDConfig.getValue("rest.cache-expires")); 
				}
				db.terminate();
			}
		});
		cmd.addListener("error",function (t) {
			console.log("error in query " + t);
			if (!responded) { responded = true; callbackFunction(false,null); db.terminate(); }
		});
		cmd.addListener("end",function (t) {
			if (!responded) { responded = true; callbackFunction(false,null); db.terminate(); }
		});	
	}
}
//Return url if can of it hashcode
TDShortener.dbURLOfHash = function dbURLOfHash(hash,callbackFunction){
	//Check for cache
	var cacheURL = MemoryCache.get(hash);
	if (TDConfig.getValue("rest.cache-state") == "1" && cacheURL && cacheURL.length > 0) { callbackFunction(true,cacheURL); }
	else {
		//Create socket
		var db = TDShortener.databaseConnection();
		//create query
		var queryStr = "SELECT * FROM " + TDConfig.getValue("database.database") + "." + TDConfig.getValue("database.table") + " WHERE hash='" + hash + "';" ;
		//execute
		var cmd = db.query(queryStr);
		var responded = false;
		//contains url
		cmd.addListener("row",function (t) {
			if (!responded) {
				var url = new Buffer(t["url"] || '', 'base64').toString('utf8');
				responded = true;
				//set cache
				if (TDConfig.getValue("rest.cache-state") == "1") { 
					if (MemoryCache.size() > TDConfig.getValue("rest.cache-rows-limit")) { console.log("In-Mem cache overflow. Cleaning!"); MemoryCache.clear(); }
					MemoryCache.set(hash,url,TDConfig.getValue("rest.cache-expires")); 
				}
				//
				callbackFunction(true,url);
				db.terminate();
			}
		});
		cmd.addListener("error",function (t) {
			console.log("error in query " + t);
			if (!responded) { responded = true; callbackFunction(false,null); db.terminate(); }
		});
		cmd.addListener("end",function (t) {
			if (!responded) { responded = true; callbackFunction(false,null); db.terminate(); }
		});
	}
}
TDShortener.databaseConnection = function databaseConnection () {
	//Create socket
	var db = require("mysql-native").createTCPClient(TDConfig.getValue("database.host"),TDConfig.getValue("database.port")); // localhost:3306 by default
	db.auto_prepate = true;
	//auth
	if (TDConfig.getValue("database.password")) { db.auth(TDConfig.getValue("database.database"),TDConfig.getValue("database.user"),TDConfig.getValue("database.password")); }
	else { db.auth(TDConfig.getValue("database.database"),TDConfig.getValue("database.user")); }
	return db;
}