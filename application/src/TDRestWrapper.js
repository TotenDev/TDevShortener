//
// TDRestWrapper.js — TDevShortener
// today is 7/12/12, it is now 5:26 PM
// created by TotenDev
// see LICENSE for details.
//

//Includes
var TDShortener = require('./TDShortener.js');
var fs = require('fs');

//Shared instance
module.exports = new TDRestWrapper();
//TDRestResponses Initializer
function TDRestWrapper () {}
//
TDRestWrapper.prototype.matchHashCode = function matchHashCode(req) {
	if (req.url.length > 8 && req.url.length < 11) {
		var toMatch = req.url.replace("/","");
		if (toMatch.length == 8 && toMatch.match("([A-Z-a-z-0-9]){8}")) { return true; }
	}return false;
}
TDRestWrapper.prototype.hashCode = function hashCode(req) {
	if (req.url.length > 8 && req.url.length < 11) {
		var toMatch = req.url.replace("/","");
		if (toMatch.length == 8 && toMatch.match("([A-Z-a-z-0-9]){8}")) { return toMatch; }
	}return null;
}
TDRestWrapper.prototype.matchRule = function matchRule(req,rule) { return req.url.match(rule); }
//
TDRestWrapper.prototype.dieInFile = function dieInFile(res,filePath) {
	res.writeHead(200);
	fs.readFile("./application" + filePath,function (err,data) {
		if (!err && data) { res.end(data); }
		else res.end();
	});
};
TDRestWrapper.prototype.dieOnIndex = function dieOnIndex(res) {
	res.writeHead(200);
	fs.readFile("./application/index.html",function (err,data) {
		if (!err && data) { res.end(data); }
		else res.end();
	});
};
TDRestWrapper.prototype.dieTooLarge = function dieTooLarge(res) {
	res.writeHead(413);
	res.end();
};
TDRestWrapper.prototype.dieBadRequest = function dieBadRequest(res) {
	res.writeHead(400);
	res.end();
};
TDRestWrapper.prototype.dieNotFound = function dieNotFound(res,path) {
	res.writeHead(404);
	res.end();
};
TDRestWrapper.prototype.dieConflict = function dieConflict(res,hashcode) {
	//conflict status code
	res.writeHead(409, {'Content-Type': 'text/plain'});
	res.end(hashcode);
};
TDRestWrapper.prototype.resSuccess = function resSuccess(res,hashcode) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end(TDShortener.formatToURL(hashcode));
};
TDRestWrapper.prototype.redirect = function redirect(res,toURL) {
	//Check if have protocol
	if (!toURL.match("http://") && !toURL.match("https://")) { toURL = "http://" + toURL; }
	//Do it
	res.writeHead(302, {'location': toURL});
	res.end();
};