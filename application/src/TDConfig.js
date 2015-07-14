//
// TDConfig.js — TDevShortener
// today is 7/10/12, it is now 5:25 PM
// created by TotenDev
// see LICENSE for details.
//

var util = require ('util');
/*
Config UltilityClass
*/
var sharedConfig = new TDConfig();
module.exports = function () { return sharedConfig; }
//
function TDConfig() {}
TDConfig.prototype.getValue = function getValue(value) { return process.env[value]; }
TDConfig.prototype.processOnTest = function processOnTest() {
  for (var i = 0; i < process.argv.length; i++) {
    if (process.argv[i] == "--test") { return true; }
  } return false;
};
