
'use strict';

var _ = require('underscore');

function CreateGetter(options) {

  return function () {
    if (!((options.getter && options.setter && options.constant) || options.isReadOnly)) {
      //throw new Error("Illegal property mixin configuration.  Cannot have a read only property with no getter or constant");
    }

    if (options.constant) {
      return options.constant;
    } else if (!options.instance || !options.lazy) {
      options.instance = options.getter.call(options.object);
    }
    return options.instance;
  }
}

function CreateNamedPropertyMixin(options) {
  var self = {
    readOnly: function () {
      options.isReadOnly = true;
      return self;
    },
    lazy: function() {
      options.lazy = true;
      return self;
    },
    getter: function (getter) {
      options.getter = getter;
      return self;
    },
    hasSetter: function (setterFunc) {
      options.setter = true;
      options.object['set' + options.name] = setterFunc ? setterFunc : function (instance) {
        options.instance = instance;
      };
      
      return self;
    },
    constant: function (value) {
      options.constant = value;
      return self;
    },
    property: function (name) {
      return CreateNamedPropertyMixin({name: name, object: options.object});
    },
    object: function () {
      return options.object;
    }
  }
  options.object['get' + options.name] = CreateGetter(options);
  return self;
}

function CreateMixin(object) {
  var self = {
    property: function (name) {
      return CreateNamedPropertyMixin({name: name, object: object});
    }
  };

  return self;
}


exports.mixin = function (object) {
  return CreateMixin(object);
}

exports.mixinProperty = function (options) {
  return _(options.self || {}).extend((function () {

    var _instance, self = {};
    self['get' + options.name] = function () {
      if (!_instance || !options.lazy) {
        _instance = options.getter();
      }
      return _instance;
    };

    if (options.setter) {
      self['set' + options.name] = function (instance) {
          _instance = instance;
      };
    }

    return self;
  })());
}
