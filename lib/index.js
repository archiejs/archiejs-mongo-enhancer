
// load inheritence utility

require('./util/inherit');

var ArchiejsEnhancers = require('archiejs').Enhancers;

var MongoEnhancer = require('./mongo_enhancer'); 

// mongodb enhancer

ArchiejsEnhancers.registerEnhancerFactory(
  "mongodb",
  function() {
    return new new MongoEnhancer();
  }
);

