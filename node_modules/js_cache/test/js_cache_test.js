(function() {
  var Store, equals;

  Store = require("../js/js_cache.js");

  equals = [];

  if (typeof test === "undefined" || test === null) {
    test = function(name, test_cb) {
      return exports[name] = function(testObj) {
        var result, _i, _len;
        equals = [];
        test_cb();
        for (_i = 0, _len = equals.length; _i < _len; _i++) {
          result = equals[_i];
          testObj.equal(result[0], result[1]);
        }
        return testObj.done();
      };
    };
  }

  if (typeof equal === "undefined" || equal === null) {
    equal = function(real, expected) {
      return equals.push([real, expected]);
    };
  }

  test("Generic Cache Operations", function() {
    var a, gen_key, missing, results, _ref;
    a = new Store(10);
    a.set("abc", 12345);
    equal(a.get("abc"), 12345);
    equal(a.size(), 1);
    a.remove("abc");
    equal(a.get("abc"), void 0);
    equal(a.size(), 0);
    a.mset({
      jkl: 123,
      def: 456,
      qwe: 1234,
      ghj: 23,
      cvb: 322,
      hjkjh: 345,
      sdfsd: 273
    });
    equal(a.size(), 7);
    a.set("jkl", 444);
    equal(a.size(), 7);
    equal(a.get("jkl"), 444);
    a.mset({
      cvbc: 111,
      ccx: 222,
      bnb: 333,
      lfd: 444
    });
    equal(a.size(), 10);
    equal(a.get("def"), void 0);
    equal(a.get("jkl"), 444);
    a.mremove(["ccx", "bnb", "lfd"]);
    equal(a.size(), 7);
    _ref = a.mget(["cvb", "qwe", "bnb"]), results = _ref[0], missing = _ref[1];
    equal(results.cvb, 322);
    equal(missing[0], "bnb");
    equal(missing.length, 1);
    gen_key = a.add(23423423);
    equal(gen_key, "jsc_0");
    gen_key = a.add(223423);
    equal(gen_key, "jsc_1");
    return equal(a.get("jsc_0"), 23423423);
  });

}).call(this);
