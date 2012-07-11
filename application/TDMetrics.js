//
// TDMetrics.js — TDevShortener
// today is 7/10/12, it is now 5:26 PM
// created by TotenDev
// see LICENSE for details.
//

//Modules
var http = require('http');
var assert = require('assert');
var querystring = require('querystring');
var TDConfig = require('./TDConfig.js');
//Asserts
assert.ok(TDConfig("name"),"TDMetrics says: 'name' is a required value and is not specified on config file.");
assert.ok(TDConfig("metrics.projectID"),"TDMetrics says: 'metrics.projectID' is a required value and is not specified on config file.");
assert.ok(TDConfig("metrics.auth"),"TDMetrics says: 'metrics.auth' is a required value and is not specified on config file.");
assert.ok(TDConfig("metrics.host"),"TDMetrics says: 'metrics.host' is a required value and is not specified on config file.");
assert.ok(TDConfig("metrics.port"),"TDMetrics says: 'metrics.port' is a required value and is not specified on config file.");
assert.ok(TDConfig("metrics.path"),"TDMetrics says: 'metrics.path' is a required value and is not specified on config file.");
//Export instance
module.exports = function (metricString,statusCode,typeString,placeString,callback) {
	return new TDMetrics(metricString,statusCode,typeString,placeString,callback);
}
//TDMetrics Initializer
function TDMetrics (metricString,statusCode,typeString,placeString,callback) {
	TDMetrics.sendMetric(metricString,statusCode,typeString,placeString,callback);
}

/**
 *	send
 **/
TDMetrics.sendMetric = function(metricString,statusCode,typeString,placeString,callback){
	var date = new Date();
	var ts = String(Math.round(date.getTime() / 1000) + date.getTimezoneOffset() * 60);
	// Build the post string from an object
	var post_data = querystring.stringify({
		'project' 	: TDConfig("metrics.projectID"),
		'metric' 	: metricString,
		'type'	  	: typeString,
		'place'		: placeString,
		'info'		: statusCode,
		'timestamp' : ts
	});
	var options = {
		'host'		: TDConfig("metrics.host"),
		'port'		: TDConfig("metrics.port"),
		'path'		: TDConfig("metrics.path"),
		'method'	: "POST",
		'headers'	: {
			'Authorization' : TDConfig("metrics.auth"),
         	'Content-Type': 'application/x-www-form-urlencoded',
          	'Content-Length': post_data.length
		}
	};
	var response = false;
	//Request
	var req = http.request( options, function(res){
		res.setEncoding('utf8');
		res.on('data', function(data){ 
			if (!response) {
				response = true;
				callback(null,true);
			}
		});
		res.on('error', function(err){ 
			if (!response) {
				response = true;
				callback(null,false);
			}
		});
		res.on('end',function () { 
			if (!response) {
				response = true;
				callback(null,true);
			}	
		});
	});
	req.on('error', function(err){
		if (!response) {
			response = true;
			callback(null,false);
		}
	});
	req.write(post_data);
	req.end();
}