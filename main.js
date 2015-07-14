//
// main.js — TDevShortener
// today is 7/10/12, it is now 5:15 PM
// created by TotenDev
// see LICENSE for details.
//

var TDConfig = require("./application/src/TDConfig.js")();

if (TDConfig.processOnTest()) {
//TESTING -- set all needed env ivars
  //overall 
  process.env["logging.log-type"]="2";
  process.env["shortener.acceptedURLS"]=["[-a-zA-Z0-9@:%_\\+.~#?&//=]{2,256}\\.[a-z]{2,4}\\b(\/[-a-zA-Z0-9@:%_\\+.~#?&//=]*)?","myAppName:\/\/[a-zA-Z0-9\\-]{36}"]; //this regex don't accept flags.. "gi" flags already added on TDShortener.js function
  //databse rest ivars
  process.env["database.host"]="db.host.com";
  process.env["database.port"]="3306";
  process.env["database.user"]="someuser";
  process.env["database.password"]="somepass";
  process.env["database.database"]="adb";
  process.env["database.table"]="atable";
  //rest env ivars
  process.env["rest.host"]="shor.it";
  process.env["rest.port"]="8080";
  process.env["rest.cache-state"]="1";
  process.env["rest.cache-expires"]="3600000";
  process.env["rest.cache-rows-limit"]="2000";
  process.env["rest.max-request-buffer"]="1000000";
  //new relic ivars
  process.env["NEW_RELIC_APP_NAME"]="myAppName";
  process.env["NEW_RELIC_LICENSE_KEY"]="myLong-License";
}

// Start new relic agent
process.env['NEW_RELIC_HOME'] = (__dirname + '/appConf/');
var newrelic = require('newrelic');
// Start rest
var TDShortenerREST = require('./application/index.js');