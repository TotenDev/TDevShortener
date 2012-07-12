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
var fs = require('fs');
//Asserts
assert.ok(TDConfig("rest.host"),"TDShortenerREST says: 'rest.host' is a required value and is not specified on config file.");
assert.ok(TDConfig("rest.port"),"TDShortenerREST says: 'rest.port' is a required value and is not specified on config file.");
//Shared instance
module.exports = new TDShortenerREST();
//TDShortener Initializer
function TDShortenerREST () {
	//Create Server
	var server = http.createServer(function (req, res) {
		if (req.method == "POST") {
			//Exectaly "/create/"
			if (req.url.match("/create/$")) {
				//Set as string, unlees data comes as buffer
				req.setEncoding("utf8");
				//Permanent chunck
				var permChunck = "";
				//Listen to Body
				req.addListener("data",function (chunck) { permChunck = permChunck + chunck; });
				//Listen to end
				req.addListener("end", function () {
					var body = TDShortenerREST.parseBody(permChunck);
					if (body.link && body.link.length > 0) {
						//Shortit
						TDShortener.shortener(body.link,function (okay,hashcode) {
							if (okay) { TDShortenerREST.resSuccess(res,hashcode); }
							else { TDShortenerREST.dieConflict(res,hashcode); }
						});
					}else TDShortenerREST.dieRequest(res);
				});
			}else TDShortenerREST.dieRequest(res);
		}
		else if (req.method == "GET"){
			//Short
			if (req.url.match("^/create/")) {
				//Get URL
				var toShort = req.url.replace("/create/","");
				if (toShort && toShort.length > 0) {
					//Shortit
					TDShortener.shortener(toShort,function (okay,hashcode) {
						if (okay) { TDShortenerREST.resSuccess(res,hashcode); }
						else { TDShortenerREST.dieConflict(res,hashcode); }
					});
				}else TDShortenerREST.dieRequest(res);
			}
			//Unshort
			else if (req.url.length > 8 && req.url.length < 11) {
				var toMatch = req.url.replace("/","");
				if (toMatch.length == 8 && toMatch.match("([A-Z-a-z-0-9]){8}")) {
					TDShortener.unShortener(toMatch,function (found,url) {
						if (found) { TDShortenerREST.redirect(res,url); }
						else { TDShortenerREST.dieConflict(res,url); }
					});
				}
				//Check for resources request
				else if (req.url.match("^/resources/")) {  TDShortenerREST.dieInFile(res,req.url); }
				else { TDShortenerREST.dieRequest(res); }
			}
			//Check for resources request
			else if (req.url.match("^/resources/")) {  TDShortenerREST.dieInFile(res,req.url); }
			else { TDShortenerREST.dieRequest(res); }
		}else TDShortenerREST.dieRequest(res);
	});
	//Starts
	server.listen((process.env.PORT || TDConfig("rest.port")),function () {
		console.log('Server is running on port:' + (process.env.PORT || TDConfig("rest.port")) + ' on host:' + TDConfig("rest.host"));
	});
	//on error
	server.addListener('error', function (e) {
		console.log("HTTP Server is not running with error:" + e);
		console.log("Killing process");
		server.close();
		process.exit(2);
	});
	//Check if is testing
	process.argv.forEach(function (val, index, array) {
		if (val == "--test") {
			setTimeout(function () {
				console.log("Server is on after 5. Closing it.");
				process.exit(0);
			},5000);
		}
	});
}



//Helpers - RESPONSES
TDShortenerREST.dieInFile = function dieInFile(res,filePath) {
	res.writeHead(201);
	fs.readFile("./application" + filePath,function (err,data) {
		if (!err && data) { res.end(data); }
		else res.end();
	});
	//Check for metrics availability
	try {
		//metricString,statusCode,typeString,placeString,callback
		var Metrics = require('./TDMetrics/TDMetrics.js')("Status 201","201","Info",filePath,function (resp,ok) { });
	} catch (e) {}
};

TDShortenerREST.dieRequest = function dieRequest(res) {
	res.writeHead(202);
	fs.readFile("./application/index.html",function (err,data) {
		if (!err && data) { res.end(data); }
		else res.end();
	});
	//Check for metrics availability
	try {
		//metricString,statusCode,typeString,placeString,callback
		var Metrics = require('./TDMetrics/TDMetrics.js')("Status 202","202","Info","/index.html",function (resp,ok) { });
	} catch (e) {}
};

TDShortenerREST.dieConflict = function dieConflict(res,hashcode) {
	//conflict status code
	res.writeHead(409, {'Content-Type': 'text/plain'});
	res.end(hashcode);
	//Check for metrics availability
	try {
		//metricString,statusCode,typeString,placeString,callback
		var Metrics = require('./TDMetrics/TDMetrics.js')("Status 409","409","Error " + hashcode,"/create/",function (resp,ok) { });
	} catch (e) {}
};

TDShortenerREST.resSuccess= function resSuccess(res,hashcode) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end(TDShortener.formatToURL(hashcode));
	//Check for metrics availability
	try {
		//metricString,statusCode,typeString,placeString,callback
		var Metrics = require('./TDMetrics/TDMetrics.js')("Status 200","200","Info","/create/",function (resp,ok) { });
	} catch (e) {}
};

TDShortenerREST.redirect = function redirect(res,toURL) {
	//Check if have protocol
	if (!toURL.match("http://") && !toURL.match("https://")) { toURL = "http://" + toURL; }
	//Do it
	res.writeHead(302, {'location': toURL});
	res.end();
	//Check for metrics availability
	try {
		//metricString,statusCode,typeString,placeString,callback
		var Metrics = require('./TDMetrics/TDMetrics.js')("Status 302","302","Info","/XXXXXXXX",function (resp,ok) { });
	} catch (e) {}
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