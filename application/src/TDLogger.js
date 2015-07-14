//
// TDLogger.js — TDevShortener
// today is 7/10/12, it is now 5:25 PM
// created by TotenDev
// see LICENSE for details.
//

//Modules
var assert = require('assert');
var TDConfig = require('./TDConfig.js')();
//Asserts
assert.ok(TDConfig.getValue("logging.log-type"),"** TDLogger ** 'logging.log-type' is a required value and is not specified.");
//Enum log types
exports.DEBUG = 2;
exports.NOTICE = 1;
exports.ERROR = 0;

//Shared instance
exports.sharedLogger = new TDLogger((TDConfig.getValue("logging.log-type") ? TDConfig.getValue("logging.log-type") : 0));
//TDLogger Initializer
function TDLogger (_type) { this.type = _type ; }
//LogIt
TDLogger.prototype.logIt = function (_type,_logStr) {
	//check if is allowed
	if (_type <= this.type) { 
		//Log to out put, if someone is listening
		require('util').log("TDLogger[" + TDLogger.logLevelString(_type) + "] " + _logStr); 
	}
}
//Help!
TDLogger.logLevelString = function (_type) {
	switch (_type) {
		case exports.DEBUG: { return "DEBUG"; } break;
		case exports.NOTICE: { return "NOTICE"; } break;
		case exports.ERROR: { return "ERROR"; } break;
		default:
	}
}