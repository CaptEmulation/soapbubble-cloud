
var Q = require('q');
var Options = require('../lib/options');
var ES5Class = require('es5class');
var _ = require('underscore');
var EventEmitter = require('events').EventEmitter;
var sprintf = require('sprintf').sprintf;
var apiResponse = require('express-api-response');

var WithSearchFields = ES5Class.$define('WithSearchField', {
  withSearchString: function (field, term) {
    if (!term) {
      term = field;
    }
    this.on('req', function (req, query) {
      query[term] = req.params[field];
    });
    this._route += sprintf("/:%s", field);
    return this;
  },
  withSearchNumber: function (field) {
    this.on('req', function (req, query) {
      query[field] = parseInt(req.params[field], 10);
    });
    this._route += sprintf("/:%s", field);
    return this;
  }
});

var ServiceDsl = ES5Class.$define('ServiceDsl', {
  construct: function (options) {
    options = Options.for(options);
    this._provider = options.expect('provider')
    this._name = options.expect('name');
    this._route = options.expect('route');
    this._find = options.default('find', 'find');
  },
  model: function () {
    return this._provider(this._name);
  },
  route: function () {
    return this._route;
  },
  justOne: function () {
    this._find = 'findOne';
    return this;
  },
  middleware: function () {
    
    return [this.route(), function(req, res, next) {
      var query = {};
      this.emit('req', req, query);
      var model = this.model();
      Q(model[this._find].call(model, query).exec())
        .then(function (all) {
          res.data = all;
        })
        .fail(function (err) {
          res.err = err;
        })
        .finally(function () {
          next();
        });
    }.bind(this), apiResponse];
  }
})
  .$implement(EventEmitter)
  .$implement(WithSearchFields);

exports.service = function (options) {
  var dsl = ServiceDsl.$create(options);
  return dsl;
}

exports.Scene = function(req, res, next) {
  Q.ninvoke(morpheus.get('Scene'), 'find', {})
    .then(function (all) {
      console.log('scene found ' + util.inspect(all));
      res.data = all;
    })
    .fail(function (err) {
      res.err = err;
    })
    .finally(function () {
      next();
    });
}
