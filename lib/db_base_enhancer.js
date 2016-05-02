// This is an abstract class.

'use strict';
var BaseEnhancerClass = require('archiejs').BaseEnhancerClass;

var DbEnhancer = function(){
    this.baseEnhancer = new BaseEnhancerClass(); // contains base class
    this.enhancerName = "dbenhancer";
};

DbEnhancer.HELP_MSG = "\n\
  This enhancer employs the following provide structure in package.json file.\n\n\
  provides: { \n\
      DBObjA: 'fileA.js' , \n\
      DBObjB: 'fileB.js' , \n\
      ...    \n\
  }\n";

(function(){
    
    this.resolveConfig = function(plugin, base){
        if(typeof plugin.provides !== 'object' || Array.isArray(plugin.provides)){
            console.log(DbEnhancer.HELP_MSG);
            throw new Error("Incorrect dbEnhancer provides format");
        }
        this.baseEnhancer.resolveConfig(plugin, base);
    };

    this.setupPlugin = function(plugin, imports, register){
        this.baseEnhancer.setupPlugin(plugin, imports, register);
    };
    
    /*
     * Abstract function
     */
    
    this.openClient = function(cb){
        throw new Error("override");
    };

    this.closeClient = function(cb){
        throw new Error("override");
    };

    this.getClient = function(){
        throw new Error("override");
    };

}).call(DbEnhancer.prototype);

module.exports = DbEnhancer;
