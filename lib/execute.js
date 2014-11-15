var ES5Class = require('es5class');
var Options = require('./options');

var BaseModule = exports.BaseModule = ES5Class.$define('BaseModule', {
  construct: function (options) {
    this.options(options).expect(this, ['handles', 'execute']);
  },
  _additionalHelp: function () {
    return this.additionalHelp && (typeof this.additionalHelp === 'function' ? this.additionalHelp() : this.additionalHelp) || "";
  },
  _additionalUsage: function () {
    return this.additionalUsage && (typeof this.additionalUsage === 'function' ? this.additionalUsage() : this.additionalUsage) || "";
  }
}).$implement(Options);

exports.Executor = ES5Class.$define('Executor', function () {
  var printArray = require('sprintf').sprintf;
  var winston = require('winston');
  var _ = require('underscore');
  
  return {
    construct: function (argv) {
      this._argv = argv;
      this._modules = [];
      this._globalOpts = [];
    },
    withGlobalOption: function (globalOpts) {
      this._globalOpts.push(this.options(globalOpts).expect(['option', 'description']));
      return this;
    },
    withShortHelp: function (sDescription) {
      this._shortHelp = sDescription;
      return this;
    },
    addModule: function (definition) {
      this._modules.push(BaseModule.$create(definition));
    },
    execute: function (command) {
      var foundCommand = _(this._modules).where({ handles: command || this._argv._[0] });
      
      if (foundCommand.length === 0) {
        winston.info(sprintf('Action [%s] not found.  Please pick a valid action: ', printArray(_(this._modules).pluck('handles'), 'or')));
        process.exit();
      }
      
      return this._execute(foundCommand[0], this._argv);
    },
    _execute: function (module, context) {
      if (typeof module.execute !== 'function') {
        throw new Error('No execute method on ' + JSON.stringify(module));
      }
      return module.execute(context);
    }
  }
}).$implement(Options)
