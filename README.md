TDev Shortener
=========================

TDev Shortener has been developed by TotenDev team, as an internal system, with the main principle of been a private and simple shortener.


Getting Started
=========
TDev Shortener is currently in development, and maintained by TotenDev Team. But stills stable for external use :).

Requirements
=========

To get it running you need `nodejs` installed, OR you can run in `Heroku` OR any `foreman` OS Based that supports `nodejs`.
`NPM` is also needed to control dependencies, after installing it, you will need to run `npm install`, so all dependencies are loaded locally. In case of Heroku it should be done automatically.


Configuration
========
All Configuration can be done through `package.json` file in root three.

---
## Database ##
Database is used for storing all shortened URL and Codes.
- `database.host` - MySQL Host. **REQUIRED**
- `database.port` - MySQL Host Port. **REQUIRED**
- `database.user` - MySQL DB User. **REQUIRED**
- `database.password` - MySQL DB Password. **REQUIRED**
- `database.database` - MySQL DB Name. **REQUIRED**
- `database.table` - MySQL DB Table Name. **REQUIRED**

---
## REST ##
REST is used for all `HTTP` talks. 
- `rest.host` - REST Listening Host. **REQUIRED**
- `rest.port` - REST Listening Port. **REQUIRED**
- `rest.cache-state` - REST Cache State (1-ON 0-OFF), it'll cache last 1000 URLs and Codes. **REQUIRED**
- `rest.cache-expires` - REST Cache expires, in milliseconds. **REQUIRED IF rest.cache-state is ON**

---
## METRICS ##
METRICS is used for storing metrics about it. It uses `TDMetrics`.
- `metrics.projectID` - METRICS Project ID. **REQUIRED**