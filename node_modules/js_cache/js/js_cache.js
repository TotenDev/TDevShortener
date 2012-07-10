(function() {
  var Store, idCounter,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  idCounter = 0;

  Store = (function() {

    Store.name = 'Store';

    function Store(_limit) {
      this._limit = _limit != null ? _limit : 1000;
      this.remove = __bind(this.remove, this);

      this._data = {};
      this._keys = [];
    }

    Store.prototype.get = function(key) {
      return this._data[key];
    };

    Store.prototype.mget = function(keys) {
      var found, key, missing, results, _i, _len;
      results = {};
      missing = [];
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        found = this.get(key);
        if (found) {
          results[key] = found;
        } else {
          missing.push(key);
        }
      }
      return [results, missing];
    };

    Store.prototype.mset = function(data, expires) {
      var key, vars, _results;
      if (expires == null) expires = false;
      _results = [];
      for (key in data) {
        vars = data[key];
        _results.push(this.set(key, vars, expires));
      }
      return _results;
    };

    Store.prototype.set = function(key, vars, expires) {
      if (expires == null) expires = false;
      if (this._data[key]) this._splice(key);
      this._data[key] = vars;
      this._keys.push(key);
      if (this._keys.length > this._limit) this._shift();
      if (expires) return setTimeout(this.remove, expires, key);
    };

    Store.prototype.add = function(vars) {
      var key;
      key = "jsc_" + idCounter++;
      this.set(key, vars);
      return key;
    };

    Store.prototype.mremove = function(keys) {
      var key, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        _results.push(this.remove(key));
      }
      return _results;
    };

    Store.prototype.remove = function(key) {
      if (this._data[key]) {
        delete this._data[key];
        return this._splice(key);
      }
    };

    Store.prototype.clear = function() {
      this._data = {};
      return this._keys = [];
    };

    Store.prototype.size = function() {
      return this._keys.length;
    };

    Store.prototype._shift = function() {
      return delete this._data[this._keys.shift()];
    };

    Store.prototype._splice = function(key) {
      return this._keys.splice(this._keys.indexOf(key), 1);
    };

    return Store;

  })();

  module.exports = Store;

}).call(this);
