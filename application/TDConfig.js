//
// TDConfig.js — TDevShortener
// today is 7/10/12, it is now 5:25 PM
// created by TotenDev
// see LICENSE for details.
//

var dconf = require('dconf');
var util = require ('util');
/*
Config UltilityClass
*/
var sharedConfig = new TDConfig();
module.exports = function (key) { return sharedConfig.getValue(key); }

function TDConfig() {
	//load config file
	defaultConfig = dconf.loadSync('package.json');
	defaultConfig.on('error', function(err) {
	    throw(err);
	});	
//	 console.log(util.inspect(defaultConfig));
}

TDConfig.prototype.getValue = function (value) {
	return defaultConfig.get(value);
}