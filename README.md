TDevShortener
=============

TDevShortener has been developed by TotenDev Studio, as an internal system with the main goal of been a private and simple shortener for anyone who needs it..

[![Build Status](https://secure.travis-ci.org/TotenDev/TDevShortener.png?branch=master)](http://travis-ci.org/TotenDev/TDevShortener) [![Dependency Status](https://gemnasium.com/TotenDev/TDevShortener.svg)](https://gemnasium.com/TotenDev/TDevShortener)


##Requirements

- [npm](https://github.com/isaacs/npm)
- [nodejs](https://github.com/joyent/node)
- mysql database

####Modules
- [mysql-native] (https://www.npmjs.com/package/mysql-native) for mysql connection
- [js_cache] (https://www.npmjs.com/package/js_cache) for in-memory cache
- [newrelic] (https://www.npmjs.com/package/newrelic) for new relic analysis


##Installing

All Stable code will be on `master` branch, any other branch is designated to unstable codes. So if you are installing for production environment, use `master` branch for better experience.

To run TDevShortener you MUST have mysql server connection and [database configured](https://github.com/TotenDev/TDevShortener/raw/master/appConf/db.sql). All credentials and preferences can be configured with ENV IVARS and are described [here](#configuration).

--

After configured your environment you can run commands below to start TDevShortener:

Download and install dependencies

	$ npm install

Start server
	
	$ 'node main.js' OR 'foreman start'
	
Also you can use command bellow for **quick testing** without any credentials

	$ 'node main.js --test'

##Configuration

All Configuration NEED to be done with ENV IVARS.

#### Database Config
Database is used for storing all shortened URL and Codes.
- `database.host` - MySQL Host. **REQUIRED**
- `database.port` - MySQL Host Port. **REQUIRED**
- `database.user` - MySQL DB User. **REQUIRED**
- `database.password` - MySQL DB Password. **OPTIONAL**
- `database.database` - MySQL DB Name. **REQUIRED**
- `database.table` - MySQL DB Table Name. **REQUIRED**

---
#### REST Config
REST is used for all `HTTP` talks. 
- `rest.host` - Listening host. **REQUIRED**
- `rest.port` - Listening port. **REQUIRED**
- `rest.cache-state` - cache state (1-ON 0-OFF), it'll cache last 1000 URLs and Codes. **REQUIRED**
- `rest.cache-expires` - cache expire time in milliseconds. **REQUIRED IF rest.cache-state is ON**
- `rest.cache-rows-limit` - cache max recoreds. **REQUIRED IF rest.cache-state is ON**
- `rest.max-request-buffer` - max request BODY buffer size. **OPTIONAL** (if not specified will use default value `256 bytes`)

---
#### Overall Config
- `logging.log-type` - Logging type.. You can use 1,2 or 3 for more verbosity. **REQUIRED**
- `shortener.acceptedURLS` - Array of regex, that will validate any URL to be shortened. **REQUIRED**
- `NEW_RELIC_APP_NAME` - New Relic application name. **REQUIRED**
- `NEW_RELIC_LICENSE_KEY` - New Relic license key. **REQUIRED**

##Rest API

####Short URL (POST)
- Method: `POST`
- URL: `example.com/create/`
- Body: `link=http://mylongurl.sobig.com/tolong`
- Success codes: 
	- `200` - `http://sh.tt/12345678`
- Error Codes: 
	- `202`
	- `409`
	- `500`
	
---
####Short URL (GET OR HEAD)
- Method: `GET` OR `HEAD`
- URL: `example.com/create/http://mylongurl.sobig.com/tolong`
- Success codes: 
	- `200` - `http://sh.tt/12345678`
- Error Codes: 
	- `202`
	- `409`
	- `500`
	
---
####Solve URL (GET OR HEAD)
- Method: `GET` OR `HEAD`
- URL: `example.com/12345678/`
- Success codes: 
	- `302`
- Error Codes: 
	- `202`
	- `409`
	- `500`

## Contributing
1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Added some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
	
##License
[GPLv3](TDevShortener/raw/master/LICENSE)
