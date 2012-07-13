//
// TDShortenerREST.js — TDevShortener
// today is 7/10/12, it is now 5:26 PM
// created by TotenDev
// see LICENSE for details.
//

//Includes
var http = require('http');
var assert = require('assert');
var TDShortener = require('./TDShortener.js');
var TDConfig = require('./TDConfig.js');
var TDRestWrapper = require('./TDRestWrapper.js');
//Asserts
assert.ok(TDConfig("rest.host"),"TDShortenerREST says: 'rest.host' is a required value and is not specified on config file.");
assert.ok(TDConfig("rest.port"),"TDShortenerREST says: 'rest.port' is a required value and is not specified on config file.");
var maxRequestBufferSize = (TDConfig("rest.max-request-buffer") ? TDConfig("rest.max-request-buffer") : "256");
//Shared instance
module.exports = new TDShortenerREST();
//TDShortener Initializer
function TDShortenerREST () {
	
	//Create Server
	var server = http.createServer(function (req, res) {
		//Set as string, unlees data comes as buffer
		req.setEncoding("utf8");
		//Routing
		if (req.method == "POST") { TDShortenerREST.postRoute(req,res); }
		else if (req.method == "GET"){ TDShortenerREST.getRoute(req,res); }
		else TDRestWrapper.dieRequest(res);
	});
	
	
	//Start servers
	server.listen((process.env.PORT || TDConfig("rest.port")),function () {
		console.log('Server is running on port:' + (process.env.PORT || TDConfig("rest.port")) + ' on host:' + TDConfig("rest.host"));
		//Check if is testing
		if (TDShortenerREST.onTest()) {
			setTimeout(function () {
				console.log("Server is on after 5. Closing it.");
				process.exit(0);
			},5000);	
		}
	});
	//on error
	server.addListener('error', function (e) {
		console.log("HTTP Server is not running with error:" + e + " \nKilling process");
		server.close();
		process.exit(2);
	});
};




//Routing
TDShortenerREST.getRoute = function getRoute(req,res) {
	//Short
	if (TDRestWrapper.matchRule(req,"^/create/")) {
		//Get URL
		var toShort = req.url.replace("/create/","");
		if (toShort && toShort.length > 0) {
			//short
			TDShortener.shortener(toShort,function (okay,hashcode) {
				if (okay) { TDRestWrapper.resSuccess(res,hashcode); }
				else { TDRestWrapper.dieConflict(res,hashcode); }
			});
		}else TDRestWrapper.dieRequest(res);
	}
	//Unshort
	else if (TDRestWrapper.matchHashCode(req)) {
		//unshort
		TDShortener.unShortener(TDRestWrapper.hashCode(req),function (found,url) {
			if (found) { TDRestWrapper.redirect(res,url); }
			else { TDRestWrapper.dieConflict(res,url); }
		});
	}
	//Check for resources request
	else if (TDRestWrapper.matchRule(req,"^/resources/")) {  TDRestWrapper.dieInFile(res,req.url); }
	else { TDRestWrapper.dieRequest(res); }
};
TDShortenerREST.postRoute = function postRoute(req,res) {
	var permChunck = "";
	var maxSizeReached = false;
	//Exectaly "/create/"
	if (TDRestWrapper.matchRule(req,"/create/$")) {
		//Listen to Body
		req.addListener("data",function (chunck) { 
			permChunck = permChunck + chunck;
			if (TDShortenerREST.largerThanLimit(permChunck)) {
				maxSizeReached = true;
				TDRestWrapper.dieTooLarge(res);
			}
		});
		//Listen to end
		req.addListener("end", function () {
			//Check is max size is not reached :)
			if (!maxSizeReached) {
				var body = TDShortenerREST.parseBody(permChunck);
				if (body.link && body.link.length > 0) {
					//Shortit
					TDShortener.shortener(body.link,function (okay,hashcode) {
						if (okay) { TDRestWrapper.resSuccess(res,hashcode); }
						else { TDRestWrapper.dieConflict(res,hashcode); }
					});
				}else TDRestWrapper.dieConflict(res);
			}//NO ELSE, IT SHOULD BE RETURN BEFORE 
		});	
	}else TDRestWrapper.dieRequest(res);
};



//Utils
TDShortenerREST.onTest = function onTest() {
	for (var i = 0; i < process.argv.length; i++) {
		if (process.argv[i] == "--test") { return true; }
	}
	return false;
};
TDShortenerREST.largerThanLimit = function largerThanLimit(string) {
	var byteCount = unescape(encodeURIComponent(string)).length;
	return (byteCount > maxRequestBufferSize);
};
TDShortenerREST.parseBody = function parseBody(string) {
	var body = {};
	var params = string.split('&');

	for (var param in params) {
		var key = params[param].split('=');
		body[key[0]] = key[1];
	}

	return body;
};