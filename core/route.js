module.exports = function (app) {
  var Q = require('q');
  var web = require('./web');
  var morpheus = require('../model/morpheus');
  var util = require('util');
  var apiResponse = require('express-api-response');

  app.get.apply(
    app, web.service({
      provider: morpheus.get,
      name: 'Scene',
      route: '/scene'
    })
      .withSearchNumber('sceneId')
      .justOne()
      .middleware()
  );
  
  app.get.apply(
    app, web.service({
      provider: morpheus.get,
      name: 'Scene',
      route: '/scenes'
    })
      .middleware()
  );
  
  app.get.apply(
    app, web.service({
      provider: morpheus.get,
      name: 'Cast',
      route: '/cast'
    })
      .withSearchString('type', '__t')
      .withSearchNumber('castId')
      .justOne()
      .middleware()
  );
  
  app.get.apply(
    app, web.service({
      provider: morpheus.get,
      name: 'Cast',
      route: '/cast'
    })
      .withSearchString('type', '__t')
      .middleware()
  );
  
  app.get.apply(
    app, web.service({
      provider: morpheus.get,
      name: 'Cast',
      route: '/casts'
    })
      .middleware()
  );
  
  app.get.apply(
    app, web.service({
      provider: morpheus.get,
      name: 'MovieSpecialCast',
      route: '/movie'
    })
      .withSearchNumber('castId')
      .justOne()
      .middleware()
  );
  
  app.get.apply(
    app, web.service({
      provider: morpheus.get,
      name: 'MovieSpecialCast',
      route: '/movies'
    })
      .middleware()
  );
  
};
