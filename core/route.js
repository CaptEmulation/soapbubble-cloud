module.exports = function (app) {
  var Q = require('q');
  var apiResponse = require('express-api-response');
  var morpheus = require('../model/morpheus');
  var util = require('util');
  
  app.get('/scene', function(req, res, next) {
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
  });
  
  app.get('/scene/:id', function(req, res, next) {
    var id = parseInt(req.params.id, 10);
    console.log(id);
    if (id) {
      console.log('by id')
      //console.log(morpheus.get('Scene'));
      Q(morpheus.get('Scene').find({ sceneId: id }).exec())
        .then(function (scene) {
          console.log('scene found ' + util.inspect(scene));
          if (scene && scene.length) {
            
            console.log(res.data);
            res.data = scene[0];
          } else {
          //  res.err = "No scenes found";
          }
        })
        .fail(function (err) {
          console.log('scene error ' + util.inspect(err));
          res.err = err;
        })
        .finally(function () {
          console.log('next');
          next();
        });
    } else {
      next();
    }
  }, apiResponse);
}
