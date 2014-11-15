

var config = require('../config');
var winston = require('winston');
var mongoose = require('mongoose');


exports.install = function (app) {
  var db = app.db = mongoose.connect(config.mongodb.uri, {server:{auto_reconnect:true}});
  return db;
}
