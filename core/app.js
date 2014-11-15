var express = require('express');
var morpheus = require('../model/morpheus');
var mongoose = require('mongoose');
var app = express();

require('./route')(app);

app.listen(4000, function (err, connection) {
  if (err) throw err;
  
  mongoose.connection.once('open', function () {
    morpheus.install(app.db);
  });

  require('../lib/db').install(app);
});

// Load config 

// Listen on port
