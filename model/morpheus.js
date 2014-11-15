var ES5Class = require('es5class');
var _ = require('underscore');
var Schema = require('mongoose').Schema;
var util = require('util');


var Morpheus = function () {
  Schema.apply(this, arguments);
};

util.inherits(Morpheus, Schema);

var Cast = function () {
  Morpheus.apply(this, arguments);
  this.add({
    castId: Number
  });
}

util.inherits(Cast, Morpheus);

var ControlledMovieCast = function () {
  Cast.apply(this, arguments);
  this.add({
    controlledLocation: {
      "x": Number,
      "y": Number
    },
    companionMovieCastId: Number,
    scale: Number,
    controlledMovieCallbacks: [ {
      frames: Number,
      direction: Number,
      callbackWhen: Number,
      gameState: Number
    } ]
  });
}

util.inherits(ControlledMovieCast, Cast);

var GameState = function () {
  Morpheus.apply(this, arguments);
  this.add({
    stateId: Number,
    initialValue: Number,
    minValue: Number,
    maxValue: Number,
    stateWraps: Number,
    value: Number
  });
}

util.inherits(GameState, Morpheus);

var HotSpot = function () {
  Cast.apply(this, arguments);
  this.add({
    comparators: [ {
      gameStateId: Number,
      testType: Number,
      value: Number
    }],
    castId: Number,
    rectTop: Number,
    rectBottom: Number,
    rectLeft: Number,
    rectRight: Number,
    cursorShapeWhenActive: Number,
    param1: Number,
    param2: Number,
    param3: Number,
    type: Number,
    gesture: Number,
    defaultPass: Boolean
  });
}

util.inherits(HotSpot, Cast);

var MovieCast = function () {
  Cast.apply(this, arguments);
  this.add({
    fileName: String
  });
}

util.inherits(MovieCast, Cast);

var PanoAnim = function () {
  MovieCast.apply(this, arguments);
  this.add({
    location: {
      "x": Number,
      "y": Number
    },
    "frame": Number,
    "looping": Boolean
  })
}

util.inherits(PanoAnim, MovieCast);

var MovieSpecialCast = function () {
  MovieCast.apply(this, arguments);
  this.add({
    location: {
      "x": Number,
      "y": Number
    },
    "startFrame": Number,
    "endFrame": Number,
    "actionEnd": Number,
    "scale": Number,
    "looping": Boolean,
    "dissolveToNextScene": Boolean,
    "nextSceneId": Number,
  });
}

util.inherits(MovieSpecialCast, MovieCast);

var isA = function (Class) {
  var C = function () {
    Class.apply(this, arguments);
  };
  
  util.inherits(C, Class);
  
  return C;
}

var PanoCast = isA(MovieCast);

var PreloadCast = isA(MovieCast);

var SoundCast = isA(MovieCast);

var Scene = function () {
  Morpheus.apply(this, arguments);
  this.add({
    sceneId: Number,
    cdFlags: Number,
    sceneType: Number,
    palette: Number,
    casts: [ Schema.Types.Mixed ]
  });
};

util.inherits(Scene, Morpheus);

exports.classes = {};

exports.install = function (db, installed) {
  var apply = function (name, Class) {
    return (exports.classes[name] = db.model(name, new Class()));
  }
  var discriminate = function (Parent, name, Class) {
    return (exports.classes[name] = Parent.discriminator(name, new Class()));
  }
  
  var cast = apply('Cast', Cast);
  discriminate(cast, 'ControlledMovieCast', ControlledMovieCast);
  discriminate(cast, 'HotSpot', HotSpot);
  discriminate(cast, 'MovieCast', MovieCast);
  discriminate(cast, 'MovieSpecialCast', MovieSpecialCast);
  discriminate(cast, 'PanoAnim', PanoAnim);
  discriminate(cast, 'PanoCast', PanoCast);
  discriminate(cast, 'PreloadCast', PreloadCast);
  discriminate(cast, 'SoundCast', SoundCast);
  
  apply('GameState', GameState);
  apply('Scene', Scene);
};

exports.get = function (className) {
  if (typeof className === 'undefined') {
    return _(exports.classes).values();
  }
  
  return exports.classes[className];
}

exports.create = function (description) {
  var options = Options.for(description).expect('type', 'name');
  throw new Error('Not finished');
}
