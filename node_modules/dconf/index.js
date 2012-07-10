/*
 * Copyright (c) 2012 Mathieu Turcotte
 * Licensed under the MIT license.
 */

var fs = require('fs');

var Config = require('./lib/config');

module.exports.load = function(filename, callback) {
    fs.readFile(filename, 'utf8', function(err, data) {
        if (err) {
           return callback(err, null);
        }

        try {
            var obj = JSON.parse(data);
            var watcher = fs.watchFile(filename, function() {});
            var config = new Config(filename, watcher, obj);
            callback(null, config);
        } catch (err) {
            callback(err, null);
        }
    });
};

module.exports.loadSync = function(filename, callback) {
    var data = fs.readFileSync(filename, 'utf8');
    var watcher = fs.watchFile(filename, function() {});
    return new Config(filename, watcher, JSON.parse(data));
};

