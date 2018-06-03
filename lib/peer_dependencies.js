/** 
 * This is a dev environment workaround.
 * 
 * require of project modules does not work when we `npm link` and
 * when developing enhancers.
 */

var archiejs, mongoose;

try {
  archiejs = require('archiejs');
  mongoose = require('mongoose');
} catch(_) {
  // workaround when `npm link`'ed for development 
  var prequire = require('parent-require')
    , archiejs = prequire('archiejs')
    , mongoose = prequire('mongoose');
}

mongoose.Promise = global.Promise;

module.exports = { archiejs, mongoose };
