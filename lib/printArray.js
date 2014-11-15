var sprint = require('sprintf').sprintf;

/**
 * Prints an array, with an optional final separator (defaults to and)
 * 
 * @param {Array} array Array to print
 * @param {String} [finalSeparator="and"] Separator text for final element for arrays with length > 1
*/
 
module.exports = function (array, finalSeparator) {
  var text = "", length = array.length;
  for (var i = 0; i < length; i ++) {
    text += (array[i] + ((i === length - 2) ? sprintf(" %s ", finalSeparator || 'and') : ((i === length -1) ? "" : ", ")));
  }
  return text;
}
