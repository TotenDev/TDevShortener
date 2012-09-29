//
// main.js — TDevShortener
// today is 7/10/12, it is now 5:15 PM
// created by TotenDev
// see LICENSE for details.
//

// Start rest
var TDShortenerREST = require('./application/index.js');

//Get Exceptions
process.on('uncaughtException', function(err) {
	console.log("uncaughtException - " + err);
	process.exit(2);
});