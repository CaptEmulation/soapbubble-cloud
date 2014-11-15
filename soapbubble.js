

var Executor = require('./lib/execute').Executor;
var Options = require('./lib/options');
var Q = require('q');
var winston = require('winston');
var sprintf = require('sprintf').sprintf;
var jf = require('jsonfile');
var util = require('util');
var morpheus = require('./model/morpheus');
var mongoose = require('mongoose');
var db = require('./lib/db');

var app = {};
var exe = Executor.$create(require('minimist')(process.argv.slice(2)));
var debugLevel = exe._argv.debug ? 'debug' : 'info'; 

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ level: debugLevel })
  ]
});

var onceOpen = Q.defer();
mongoose.connection.once('open', function () {
  onceOpen.resolve();
});

var dbSession = function () {
  
  return onceOpen.promise.then(function () {
      logger.debug('connected to db');
      morpheus.install(app.db, function (type) {
        logger.debug('Installed ' + type);
      });
      return app.db;
    });
}

var closeDbSession = function (promise) {
  return promise.fail(function (err) {
    logger.error('failed to open mongodb :' + util.inspect(err));
  })
  .finally(function (final) {
    logger.debug('Closing mongodb connection');
    mongoose.connection.close();
  })
}

db.install(app);

exe.addModule({
  handles: 'db',
  execute: (function () {
    
    return function (context) {
      var options = Options.$create().options(context);
          
      app.whenDbLoaded.then(function (db) {
        logger.info('DB loaded');
      });
    }
  }())
});

exe.addModule({
  handles: 'validate',
  execute: function (context) {
    var options = Options.$create().options(context);
    var once = options.default('once', false);
    var passed = 0, failed = 0;
    /** @type {Array} */ var items; 
        
    jf.readFile(options.expect('file'), function (err, obj) {
      
      
    });
      
  }
});

exe.addModule({
  handles: 'count',
  execute: function (context) {
    var options = Options.$create().options(context);
    var value = context._[1];
    closeDbSession(dbSession().then(function (db) {
      
      return Q.ninvoke(db.model(value), 'count', {}).then(function (count) {
        logger.info(count);
      });
      
    }));
  }
});

exe.addModule({
  handles: 'empty',
  execute: function (context) {
    var options = Options.$create().options(context);
    var value = context._[1];
    closeDbSession(dbSession().then(function (db) {
      var promise;
      if (value) {
        promise = Q.ninvoke(morpheus.get(value), 'remove', {});
      } else {
        promise = Q.all(morpheus.get().map(function (c) {
          return Q.ninvoke(c, 'remove', {});
        }));
      }
      return promise.then(function () {
        logger.info('Done');
      })
    }));
  }
});

exe.addModule({
  handles: 'import',
  execute: function (context) {
    var options = Options.$create().options(context);
    var once = options.default('once', false);
    var passed = 0, failed = 0;
    /** @type {Array} */ var items;
    
    jf.readFile(options.expect('file'), function (err, obj) {
      if (err) throw err;
      logger.info('Morpheus JSON loaded.');

      dbSession().then(function (db) {
        if (util.isArray(obj)) {
          items = once ? [ obj[0] ] : obj;
        } else {
          throw new Error("I don't parse single objects for some reason");
        }
        
        var everythingPassed = [];
        
        if (!items || items && !items.length) {
          logger.warn('No objects to process');
        }
        
        var length = items.length;
        logger.info(sprintf('Processing %d objects', length));
        
        items.forEach(function (morpheusObj, index) {
          // Create model
          var Model = morpheus.get(morpheusObj.type);
          var defer = Q.defer();
          
          if (!Model) {
            defer.reject('Failed to create DB Model for ' + morpheusObj.type);
          } else {
            var model = new Model(morpheusObj.data);
            model.save(function (err, model) {
              if (err) {
                defer.reject(err, model);
              } else {
                defer.resolve(model);
              }
            });
          }
          
          everythingPassed.push(defer.promise.then(function (model) {
            // Reset display
            process.stdout.cursorTo(0);
            process.stdout.write(sprintf('(%d/%d)', ++passed, length));
            return model;
          }, function (err) {
            logger.error(util.inspect(err));
          }));
        });
        
        // Wait for everything
        return closeDbSession(Q.all(everythingPassed)
          .then(function (everything) {
            process.stdout.write('\n');
          })
        );
      }, function (err) {
        logger.error('Failed to load db because: ' + util.inspect(err));
      });
      
    });
  }
});

exe.addModule((function () {
  var AWS = require('aws-sdk');
  var config = require('./config');
  var fs = require('fs');

  AWS.config.loadFromPath('./credentials.json');
  var s3 = new AWS.S3();   

  return {
    handles: 'upload',
    execute: function (context) {
      var options = Options.for(context);
      var basePath = options.default('basePath', '.');
      var connections = options.default('connections', 4);
      var force = options.default('force', false);
      var chunk = 2 ^ options.default('chunk', 16);
      
      var putAsset = function (cast) {
        var defer = Q.defer();
        var fileName = cast.fileName;
        var asset = basePath + '/' + fileName;
        
        var fileStream = fs.createReadStream(asset);
        
        fileStream.on('error', function (err) {
          defer.reject(err);
        });
        
        var s3Send = function () {
          logger.info(sprintf('Sending %s to %s', fileName, config.amazon.Bucket));
          
          Q.ninvoke(s3, 'putObject', {
            Bucket: config.amazon.Bucket,
            Key: fileName,
            Body: fileStream
          })
            .then(function () {
              logger.debug(sprintf('Finished sending %s', fileName));
              defer.resolve();
            })
            .fail(function (err) {
              defer.reject(err);
            });
        }
        
        fileStream.on('open', function () {
          if (force) {
            s3Send();
          } else {
            Q.ninvoke(s3, 'headObject', {
              Bucket: config.amazon.Bucket,
              Key: fileName
            }).then(function (metadata) {
              logger.info(sprintf('Object %s exists', fileName));
              defer.resolve();
            })
            .fail(function (err) {
              if (err && err.code === 'Not Found') {
                s3Send();
              }
            });
          }
          
        });
        
        logger.debug(sprintf('Loading from disk %s', asset));
        
        return defer.promise;
      }
      
      var createConnection = function (casts, castIndex) {
        return putAsset(casts[castIndex]).fail(function (err) {
          logger.error(err);
        });
      }
      
      logger.debug('Finding all assets');
      dbSession().then(function (db) {
        Q(morpheus.get('Cast').find({
          fileName: { $exists: true }
        }).exec())
          .then(function (casts) {
            logger.debug(sprintf('Found %s assets', casts.length));
            var conCount = 0, castIndex = 0, promises = [];
            
            for (var i = 0; i <= connections - 1; i++) {
              conCount++;
              promises.push(createConnection(casts, i).then((function () {
                var handler = function () {
                  conCount--;
                  i++;
                  if (i <= casts.length) {
                    return createConnection(casts, i).then(handler);
                  }
                }
                
                return handler;
              }())));
            }
            
            return closeDbSession(Q.allSettled(promises))
          });
      });
    }
  }
}()));

exe.execute();
