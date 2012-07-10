/*
 * Copyright (c) 2012 Mathieu Turcotte
 * Licensed under the MIT license.
 */

var dconf = require('../index'),
    util = require('util');

dconf.load('./config.json', function(err, config) {
    console.log(util.inspect(config));

    config.on('error', function(err) {
        console.log(err);
    });

    config.on('update', function() {
        console.log(util.inspect(config));

        console.log('widget.debug: ' + config.get('widget.debug'));
        console.log('widget.window.title: ' + config.get('widget.window.title'));
        console.log('widget.window.height: ' + config.get('widget.window.height'));
    });
});

