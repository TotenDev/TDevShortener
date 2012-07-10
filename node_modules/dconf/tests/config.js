/*
 * Copyright (c) 2012 Mathieu Turcotte
 * Licensed under the MIT license.
 */

var events = require('events'),
    util = require('util');

var testCase = require('nodeunit').testCase,
    hijack = require('hijack'),
    sinon = require('sinon');

var Config = require('../lib/config');

var PREV_STAT = { mtime: new Date(1336409838227) };
var CURR_STAT = { mtime: new Date(1336409838228) };

exports["Config"] = testCase({
    setUp: function(callback) {
        this.filename = "filename.txt";

        this.watcher = new events.EventEmitter();
        this.watcher.close = sinon.spy();

        this.fs = hijack.require('fs');
        this.clock = sinon.useFakeTimers();

        callback();
    },

    tearDown: function(callback) {
        this.fs.restoreAll();
        this.clock.restore();
        callback();
    },

    "retrieving an option with an empty path should throw": function(test) {
        var config = new Config(null, this.watcher, {});
        test.throws(function() {
            config.get('');
        });
        test.done();
    },

    "retrieving an option with no path should throw": function(test) {
        var config = new Config(null, this.watcher, {});
        test.throws(function() {
            config.get();
        });
        test.done();
    },

    "retrieving an option should return it's value": function(test) {
        var config = new Config(null, this.watcher, {
            a: 'ok'
        });
        test.equals(config.get('a'), 'ok');
        test.done();
    },

    "retrieving a nested option should return it's value": function(test) {
        var config = new Config(null, this.watcher, {
            a: {
                b: {
                    c: 'ok'
                }
            }
        });
        test.equals(config.get('a.b.c'), 'ok');
        test.done();
    },

    "retrieving an undefined option should return undefined": function(test) {
        var config = new Config(null, this.watcher, {});
        test.equals(config.get('a.b.c'), undefined);
        test.done();
    },

    "retrieving an undefined option with default should return the default": function(test) {
        var config = new Config(null, this.watcher, {});
        test.equals(config.get('a.b.c', 1234), 1234);
        test.done();
    },

    "file change should trigger a configuration reload": function(test) {
        var json = '{ "a": { "b": { "c": "ok" } } }';
        var readFile = sinon.stub().withArgs(this.filename)
                                   .yields(null, json);
        var config = new Config(null, this.watcher, {});
        this.fs.replace('readFile', readFile);

        this.watcher.emit('change', CURR_STAT, PREV_STAT);
        this.clock.tick(config.RELOAD_DELAY);

        test.equals(config.get('a.b.c'), 'ok');
        test.done();
    },

    "file change with same mtime should be ignored": function(test) {
        var config = new Config(null, this.watcher, {});
        var readFile = sinon.spy();
        this.fs.replace('readFile', readFile);

        this.watcher.emit('change', CURR_STAT, CURR_STAT);
        this.clock.tick(config.RELOAD_DELAY);

        test.equals(readFile.callCount, 0);
        test.done();
    },

    "file change within RELOAD_DELAY should only trigger on update": function(test) {
        var config = new Config(null, this.watcher, {});

        var readFile = sinon.stub().withArgs(this.filename).yields(null, '{}');
        this.fs.replace('readFile', readFile);

        var updateSpy = sinon.spy();
        config.on('update', updateSpy);

        this.watcher.emit('change', CURR_STAT, PREV_STAT);
        this.clock.tick(config.RELOAD_DELAY / 2);

        this.watcher.emit('change', CURR_STAT, PREV_STAT);
        this.clock.tick(config.RELOAD_DELAY / 2);

        this.watcher.emit('change', CURR_STAT, PREV_STAT);
        this.clock.tick(config.RELOAD_DELAY);

        test.ok(updateSpy.calledOnce);
        test.done();
    },

    "an error event should be emitted when the config file can't be loaded": function(test) {
        var config = new Config(null, this.watcher, {});

        var readFile = sinon.stub().withArgs(this.filename).yields(new Error(), null);
        this.fs.replace('readFile', readFile);

        var errorSpy = sinon.spy();
        config.on('error', errorSpy);

        this.watcher.emit('change', CURR_STAT, PREV_STAT);
        this.clock.tick(config.RELOAD_DELAY);

        test.ok(errorSpy.calledOnce);
        test.done();
    },

    "an error event should be emitted when the config file is malformed": function(test) {
        var config = new Config(null, this.watcher, {});

        var readFile = sinon.stub().withArgs(this.filename).yields(null, '}{');
        this.fs.replace('readFile', readFile);

        var errorSpy = sinon.spy();
        config.on('error', errorSpy);

        this.watcher.emit('change', CURR_STAT, PREV_STAT);
        this.clock.tick(config.RELOAD_DELAY);

        test.ok(errorSpy.calledOnce);
        test.done();
    },

    "FSWatcher error should be reemitted": function(test) {
        var config = new Config(null, this.watcher, {});

        var errorSpy = sinon.spy();
        config.on('error', errorSpy);

        this.watcher.emit('error');

        test.ok(errorSpy.calledOnce);
        test.done();
    },

    "closing the config should close the FSWatcher instance": function(test) {
        var config = new Config(null, this.watcher, {});

        config.close();

        test.ok(this.watcher.close.calledOnce);
        test.done();
    },

    "closing the config should remove all listeners": function(test) {
        var config = new Config(null, this.watcher, {});

        var listener = sinon.spy();
        config.on('foo', listener);

        config.close();

        config.emit('foo');

        test.equals(listener.callCount, 0);
        test.done();
    },

    "closing the config should stop any scheduled reload": function(test) {
        var config = new Config(null, this.watcher, {});
        var readFile = sinon.spy();
        this.fs.replace('readFile', readFile);

        this.watcher.emit('change', CURR_STAT, PREV_STAT);
        config.close();

        this.clock.tick(config.RELOAD_DELAY);

        test.ok(!readFile.called);
        test.done();
    }
});

