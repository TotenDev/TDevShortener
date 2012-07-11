TDevShortener [![Build Status](https://secure.travis-ci.org/TotenDev/TDevShortener.png?branch=master)](http://travis-ci.org/TotenDev/TDevShortener)
=========================

TDevShortener has been developed by TotenDev team, as an internal system with the main principle of been a private and simple shortener for anyone who wants it.

Requirements
=========
- npm
- nodejs **(and some dependencies)**
- mysql server connection
- TDevMetrics **OPTIONAL**

Installing
=========
All Stable code will be on `master` branch, any other branch is designated to unstable codes. So if you are installing for production environment, use `master` branch for better experience.

To run TDevShortener you MUST have mysql server connection and [database configured](/raw/master/application/db.sql). All credentials and preferences can be configured at package.json and are described [here](#configuration).

After configured your environment you can run commands below to start TDevShortener:

	1.npm install
	2.npm test
	3.'node main.js' OR 'foreman start'

Configuration
========
All Configuration can be done through `package.json` file in root three.

---
#### Database Config ####
Database is used for storing all shortened URL and Codes.
- `database.host` - MySQL Host. **REQUIRED**
- `database.port` - MySQL Host Port. **REQUIRED**
- `database.user` - MySQL DB User. **REQUIRED**
- `database.password` - MySQL DB Password. **REQUIRED**
- `database.database` - MySQL DB Name. **REQUIRED**
- `database.table` - MySQL DB Table Name. **REQUIRED**

---
#### REST Config ####
REST is used for all `HTTP` talks. 
- `rest.host` - REST Listening Host. **REQUIRED**
- `rest.port` - REST Listening Port. **REQUIRED**
- `rest.cache-state` - REST Cache State (1-ON 0-OFF), it'll cache last 1000 URLs and Codes. **REQUIRED**
- `rest.cache-expires` - REST Cache expires, in milliseconds. **REQUIRED IF rest.cache-state is ON**

---
#### METRICS Config ####
This module is complete **optional** and can be disabled by removing `metrics` root key from `package.json` file.
This module is used to storing metrics about it use. It consumes `TDMetrics` API.
- `metrics.host` - Metrics server host . **REQUIRED IF ENABLED**
- `metrics.port` - Metrics server port . **REQUIRED IF ENABLED**
- `metrics.path` - Metrics server path. (Use if you know what you doing) **OPTIONAL**
- `metrics.projectID` - `TDMetrics` ProjectID parameter. **REQUIRED IF ENABLED**
- `metrics.auth` - `TDMetrics` authentication. **REQUIRED IF ENABLED**

Rest API
========

---
####Short URL (POST)####
- Method: `POST`
- URL: `example.com/create/`
- Body: `http://mylongurl.sobig.com/tolong`
- Success codes: 
	- `200` - `http://sh.tt/12345678`
- Error Codes: 
	- `202`
	- `409`
	- `500`
	
---
####Short URL (GET)####
- Method: `GET`
- URL: `example.com/create/http://mylongurl.sobig.com/tolong`
- Success codes: 
	- `200` - `http://sh.tt/12345678`
- Error Codes: 
	- `202`
	- `409`
	- `500`

---
####Solve URL####
- Method: `GET`
- URL: `example.com/12345678/`
- Success codes: 
	- `302`
- Error Codes: 
	- `202`
	- `409`
	- `500`
	
License
========
[GNU GENERAL PUBLIC LICENSE V3](raw/master/LICENSE)