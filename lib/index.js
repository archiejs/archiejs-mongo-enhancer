
// load inheritence utility

require('./util/inherit');

var { archiejs } = require('./peer_dependencies');

var ArchieEnhancers = archiejs.Enhancers;

var MongoEnhancer = require('./mongo_enhancer'); 

// mongodb enhancer

ArchieEnhancers.registerEnhancerFactory(
  "mongodb",
  function() {
    return new MongoEnhancer();
  }
);

