var ES5Class = require('es5class');
var _ = require('underscore');
var Schema = require('mongoose').Schema;

var Morpheus = exports.Morpheus = ES5Class.$define('Morpheus', {
  construct: function () {
    Schema.apply(this, arguments);
  }
});


var Cast = exports.Cast = Morpheus.$define('Cast', {
  construct: function ($super, meta) {
    $super(_({
      castId: { type: Number, default: -1 }
    }).extend(meta || {}));
  }
});

var ControlledMovieCast = exports.ControlledMovieCast = Cast.$define('ControlledMovieCast', {
  construct: function ($super, meta) {
    $super(_({
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
    }).extend(meta || {}));
  }
});

var GameState = exports.GameState = Morpheus.$define('GameState', {
  construct: function ($super, meta) {
    $super(_({
      stateId: { type: Number, default: -1 },
      initialValue: { type: Number, default: -1 },
      minValue: { type: Number, default: -1 },
      maxValue: { type: Number, default: -1 },
      stateWraps: { type: Number, default: -1 },
      value: { type: Number, default: -1 }
    }).extend(meta || {}));
  }
});

var HotSpot = exports.HotSpot = Cast.$define('HotSpot', {
  construct: function ($super, meta) {
    $super(_({
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
    }).extend(meta || {}));
  }
});

var MovieCast = exports.MovieCast = Cast.$define('MovieCast', {
  construct: function ($super, meta) {
    $super(_({
      fileName: { type: String, default: '' }
    }).extend(meta || {}));
  }
});

var PanoAnim = exports.PanoAnim = MovieCast.$define('PanoAnim', {
  construct: function ($super, meta) {
    $super(_({
      "locX": { type: Number, default: -1 },
      "locY": { type: Number, default: -1 },
      "frame": { type: Number, default: -1 },
      "looping": { type: Boolean, default: true }
    }).extend(meta || {}));
  }
});

var MovieSpecialCast = exports.MovieSpecialCast = MovieCast.$define('MovieSpecialCast', {
  construct: function ($super, meta) {
    $super(_({
      "locX": { type: Number, default: -1 },
      "locY": { type: Number, default: -1 },
      "startFrame": { type: Number, default: -1 },
      "endFrame": { type: Number, default: -1 },
      "actionEnd": { type: Number, default: -1 },
      "scale": { type: Number, default: -1.0 },
      "looping": { type: Boolean, default: true },
      "dissolveToNextScene": { type: Boolean, default: true },
      "nextSceneId": { type: Number, default: -1 },
    }).extend(meta || {}));
  }
});

var PanoCast = exports.PanoCast = MovieCast.$define('PanoCast');

var PreloadCast = exports.PreloadCast = MovieCast.$define('PreloadCast');

var SoundCast = exports.PreloadCast = MovieCast.$define('SoundCast');

var Scene = exports.Scene = Morpheus.$define('Scene', {
  construct: function ($super, meta) {
    $super(_({
      sceneId: { type: Number, default: -1 },
      cdFlags: { type: Number, default: -1 },
      sceneType: { type: Number, default: -1 },
      palette: { type: Number, default: -1 },
      casts: [ Schema.Types.ObjectId ]
    }).extend(meta || {}));
  }
});

exports.classes = [];

exports.install = function (db, installed) {
  var apply = function (Class) {
    if (typeof installed === 'function') installed(Class.$className);
    exports.classes.push({
      className: Class.$className,
      Class: db.model(Class.$className, Class.$create())
    });
  }
  apply(Cast);
  apply(ControlledMovieCast);
  apply(GameState);
  apply(HotSpot);
  apply(MovieCast);
  apply(MovieSpecialCast);
  apply(PanoAnim);
  apply(PanoCast);
  apply(PreloadCast);
  apply(SoundCast);
  apply(Scene);
};

exports.get = function (className) {
  if (typeof className === 'undefined') {
    return _(exports.classes).pluck('Class');
  }
  
  var found = _(exports.classes).where({ className: className });
  if (found.length) {
    return found[0].Class;
  }
}

exports.create = function (description) {
  var options = Options.for(description).expect('type', 'name');
  throw new Error('Not finished');
}
