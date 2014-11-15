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
    castId:{ type: Number, default: -1 }
  });
}

util.inherits(Cast, Morpheus);

var ControlledMovieCast = function () {
  Cast.apply(this, arguments);
  this.add({
    posX: { type: Number, default: -1 },
    posY: { type: Number, default: -1 },
    companionMovieCastId: { type: Number, default: -1 },
    scale: { type: Number, default: -1.0 },
    controlledMovieCallbacks: [ {
      frames: { type: Number, default: -1 },
      direction: { type: Number, default: 0 },
      callbackWhen: { type: Number, default: -1 },
      gameState: { type: Number, default: -1  }
    } ]
  });
}

util.inherits(ControlledMovieCast, Cast);

var GameState = function () {
  Morpheus.apply(this, arguments);
  this.add({
    stateId: { type: Number, default: -1 },
    initialValue: { type: Number, default: -1 },
    minValue: { type: Number, default: -1 },
    maxValue: { type: Number, default: -1 },
    stateWraps: { type: Number, default: -1 },
    value: { type: Number, default: -1 }
  });
}

util.inherits(GameState, Morpheus);

var HotSpot = function () {
  Cast.apply(this, arguments);
  this.add({
    comparators: [ {
      gameStateId: { type: Number, default: -1 },
      testType: { type: Number, default: -1 },
      value: { type: Number, default: -1 }
    }],
    castId: { type: Number, default: -1 },
    rectTop: { type: Number, default: -1 },
    rectBottom: { type: Number, default: -1 },
    rectLeft: { type: Number, default: -1 },
    rectRight: { type: Number, default: -1 },
    cursorShapeWhenActive: { type: Number, default: -1 },
    param1: { type: Number, default: -1 },
    param2: { type: Number, default: -1 },
    param3: { type: Number, default: -1 },
    type: { type: Number, default: -1 },
    gesture: { type: Number, default: -1 },
    defaultPass: { type: Boolean, default: false }
  });
}

util.inherits(HotSpot, Cast);

var MovieCast = function () {
  Cast.apply(this, arguments);
  this.add({
    fileName: { type: String, default: '' }
  });
}

util.inherits(MovieCast, Cast);

var PanoAnim = function () {
  MovieCast.apply(this, arguments);
  this.add({
    "locX": { type: Number, default: -1 },
    "locY": { type: Number, default: -1 },
    "frame": { type: Number, default: -1 },
    "looping": { type: Boolean, default: true }
  })
}

util.inherits(PanoAnim, MovieCast);

var MovieSpecialCast = function () {
  MovieCast.apply(this, arguments);
  this.add({
    "locX": { type: Number, default: -1 },
    "locY": { type: Number, default: -1 },
    "startFrame": { type: Number, default: -1 },
    "endFrame": { type: Number, default: -1 },
    "actionEnd": { type: Number, default: -1 },
    "scale": { type: Number, default: -1.0 },
    "looping": { type: Boolean, default: true },
    "dissolveToNextScene": { type: Boolean, default: true },
    "nextSceneId": { type: Number, default: -1 },
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
    sceneId: { type: Number, default: -1 },
    cdFlags: { type: Number, default: -1 },
    sceneType: { type: Number, default: -1 },
    palette: { type: Number, default: -1 },
    casts: [ Schema.Types.ObjectId ]
  });
};

util.inherits(Scene, Morpheus);

exports.classes = {};

exports.install = function (db, installed) {
  var apply = function (name, Class) {
    if (typeof installed === 'function') installed(name);
    exports.classes[name] = db.model(name, new Class());
  }
  apply('Cast', Cast);
  apply('ControlledMovieCast', ControlledMovieCast);
  apply('GameState', GameState);
  apply('HotSpot', HotSpot);
  apply('MovieCast', MovieCast);
  apply('MovieSpecialCast', MovieSpecialCast);
  apply('PanoAnim', PanoAnim);
  apply('PanoCast', PanoCast);
  apply('PreloadCast', PreloadCast);
  apply('SoundCast', SoundCast);
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
