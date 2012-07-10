# Configuration file loader and monitor for Node.js [![Build Status](https://secure.travis-ci.org/MathieuTurcotte/node-config.png?branch=master)](http://travis-ci.org/MathieuTurcotte/node-config)

Load and monitor a configuration file.

## Installation

```
npm install dconf
```

## Example

Suppose the following configuration file.

```json
{
    "widget": {
        "debug": "on",
        "window": {
            "height": 500,
            "name": "main_window",
            "title": "Sample Konfabulator Widget",
            "width": 500
        }
    }
}
```

To load it, one would do:

``` js
var dconf = require('dconf');

var config = dconf.loadSync('./config.json');

config.on('error', function(err) {
    console.log(err);
});

config.on('update', function() {
    console.log(util.inspect(config));

    console.log(config.get('widget.debug'));
    console.log(config.get('widget.window.title'));
    console.log(config.get('widget.window.height'));
});
```

## API

### Package dconf

#### dconf.load(filename, callback)

- filename: configuration file path
- callback: continuation callback

Asynchronously load a configuration file.

The callback will be called with two arguments (err, config). On error, config
will be null and err will contain an error object.

Returns a `Config` instance (see bellow).

#### dconf.loadSync(filename)

- filename: configuration file path

Asynchronously load a configuration file.

Returns a `Config` instance (see bellow).

### Class Config

The `Config` class isn't intended to be instantiated directly by clients. Use
`dconf.load` or `dconf.loadSync` to obtain a new instance.

#### config.get(path, default)

- path: options path, e.g. `foo.bar.biz`
- default: value to use if option isn't specified in config file

#### config.inspect()

Return a string representing the currently loaded configuration.

#### config.close()

Stop monitoring the underlying config file and remove all listeners.

#### Event: 'update'

Emitted when the configuration values are updated, i.e. when the configuration
file is successfully reloaded.

#### Event: 'error'

- err: error object

Emitted when an error occurs while watching/reading/parsing the config file.

## License

This code is free to use under the terms of the [MIT license](http://mturcotte.mit-license.org/).
