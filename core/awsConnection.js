var AWS = require('aws-sdk');

AWS.config.loadFromPath('../credentials.json');

var BubbleConnection = function () {
  
}

BubbleConnection.prototype = Object.create(null, {
  s3: {
    get: (function () {
      var s3;
      return function () {
        if (!s3) {
          s3 = new AWS.S3();
        }
        return s3;
      };
    }())
  }
})


exports.factory = function (options) {
  return new BubbleConnection(options);
}

exports.Class = BubbleConnection;
