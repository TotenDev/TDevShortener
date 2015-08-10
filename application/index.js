//
// TDShortenerREST.js — TDevShortener
// today is 7/10/12, it is now 5:26 PM
// created by TotenDev
// see LICENSE for details.
//

//Includes
var http = require('http');
var assert = require('assert');
var TDShortener = require('./src/TDShortener.js');
var TDConfig = require('./src/TDConfig.js')();
var TDRestWrapper = require('./src/TDRestWrapper.js');
//Asserts
assert.ok(TDConfig.getValue("rest.host"),"** TDShortenerREST ** 'rest.host' is a required value and is not specified.");
assert.ok(TDConfig.getValue("rest.port"),"** TDShortenerREST ** 'rest.port' is a required value and is not specified.");
var maxRequestBufferSize = (TDConfig.getValue("rest.max-request-buffer") ? TDConfig.getValue("rest.max-request-buffer") : "256");
var restFallbackURL = (TDConfig.getValue("rest.fallbackURL") ? TDConfig.getValue("rest.fallbackURL") : "none");

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
		else if (req.method == "GET" || req.method == "HEAD"){ TDShortenerREST.getRoute(req,res); }
		else TDRestWrapper.dieNotFound(res,req.path);
	});
	
	
	//Start servers
	server.listen((process.env.PORT || TDConfig.getValue("rest.port")),function () {
		console.log('** TDShortenerREST ** Server is running on port:' + (process.env.PORT || TDConfig.getValue("rest.port")) + ' on host:' + TDConfig.getValue("rest.host"));
        //Check if is testing
        if (TDConfig.processOnTest()) {
          setTimeout(function () {
            console.log("** TDShortenerREST ** Server is on after 5 seconds. Closing it.");
            process.exit(0);
          },5000);	
        }
	});
	//on error
	server.addListener('error', function (e) {
		console.log("** TDShortenerREST ** HTTP Server is not running with error:" + e + " \nKilling process");
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
				else { TDRestWrapper.dieBadRequest(res,hashcode); }
			});
		}else TDRestWrapper.dieBadRequest(res,"Invalid URL?");
	}
	//Unshort
	else if (TDRestWrapper.matchHashCode(req)) {
		TDShortener.unShortener(TDRestWrapper.hashCode(req),function (found,url) {
			if (found) { TDRestWrapper.redirect(res,url); }
			else if (restFallbackURL != "none") { TDRestWrapper.redirect(res,restFallbackURL); }
           else { TDRestWrapper.dieBadRequest(res,"Can't find URL: " + url); }
		});
	} 
	//Health check
	else if (TDRestWrapper.matchRule(req,"^/healthCheck")) { TDRestWrapper.dieInString(res, "healthy!"); }
	//Check for resources request
	else if (TDRestWrapper.matchRule(req,"^/resources/")) {  TDRestWrapper.dieInFile(res,req.url); }
	else { TDRestWrapper.dieOnIndex(res); }
};
TDShortenerREST.postRoute = function postRoute(req,res) {
	var permChunck = "";
	var maxSizeReached = false;
	
	//Exactly "/create/"
	if (TDRestWrapper.matchRule(req,"/create/$")) {
		//Listen to Body
		req.addListener("data",function (chunck) { 
			permChunck = permChunck + chunck;
			if (TDShortenerREST.largerThanLimit(permChunck)) { maxSizeReached = true; TDRestWrapper.dieTooLarge(res); }
		});
		//Listen to end
		req.addListener("end", function () {
			//Check is max size is not reached :)
			if (!maxSizeReached) {
				var body = TDShortenerREST.parseBody(permChunck);
				if (body.link && body.link.length > 0) {
					TDShortener.shortener(body.link,function (okay,hashcode) {
						if (okay) { TDRestWrapper.resSuccess(res,hashcode); }
						else { TDRestWrapper.dieBadRequest(res,hashcode); }
					});
				}else TDRestWrapper.dieBadRequest(res, "Invalid URL?");
			}
		});	
	}else TDRestWrapper.dieNotFound(res,req.path);
};



//Utils
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