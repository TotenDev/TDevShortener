/*
 * Copyright (c) 2012 Mathieu Turcotte
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs'),
    util = require('util'),
    events = require('events');

function Config(filename, watcher, config) {
    events.EventEmitter.call(this);

    this.filename = filename;
    this.watcher = watcher;
    this.config = config;

    this.timerId = -1;

    this.watcher.on('change', this.handleChange.bind(this));
    this.watcher.on('error', this.handleError.bind(this));

    this.on('error', function() {});
}
util.inherits(Config, events.EventEmitter);

Config.prototype.UPDATE_EVENT = 'update';

Config.prototype.RELOAD_DELAY = 1000; // ms

Config.prototype.get = function(path, def) {
    if (!path || path === '') {
        throw new Error('Invalid path [' + path + '].');
    }

    var part,
        parts = path.split('.'),
        option = this.config;

    do {
        part = parts.splice(0, 1);
        option = option[part];
    } while (parts.length > 0 && option);

    return option || def;
};

Config.prototype.close = function() {
    clearTimeout(this.timerId);
    this.watcher.close();
    this.removeAllListeners();
};

Config.prototype.inspect = function() {
    return util.inspect(this.config);
};

Config.prototype.handleChange = function(curr, prev) {
    if (curr.mtime.getTime() !== prev.mtime.getTime()) {
        this.scheduleReload();
    }
};

Config.prototype.scheduleReload = function() {
    clearTimeout(this.timerId);
    this.timerId = setTimeout(this.reload.bind(this),
                              this.RELOAD_DELAY);
};

Config.prototype.reload = function() {
    fs.readFile(this.filename, 'utf8', this.handleReload.bind(this));
};

Config.prototype.handleReload = function(err, data) {
    if (err) {
        this.emit('error', err);
        this.scheduleReload();
    } else {
        this.updateConfigFromJSON(data);
    }
};

Config.prototype.updateConfigFromJSON = function(data) {
    try {
        this.config = JSON.parse(data);
        this.emit(this.UPDATE_EVENT);
    } catch (err) {
        this.emit('error', err);
    }
};

Config.prototype.handleError = function(err) {
    this.emit('error', err);
};

module.exports = Config;

