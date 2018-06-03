'use strict';

var debug = require('debug')('archiejs-mongo-enhancer');

// TODO fix bug in deep inheritence
var DbEnhancer = require('./db_base_enhancer');

var MongodbEnhancer = function(){
    DbEnhancer.call(this); // override functions
    this.enhancerName = "mongodb-enhancer";
    this.baseEnhancer.__instantiateBeforeInjection = false;
    this.mongoConfig = {};

    // todo (check - is it better to register/unregister this in open/closeClient)
    var me = this;
    process.once( 'exit', function (sig) {
        me.closeClient();
    });
};

MongodbEnhancer.extends(DbEnhancer);

MongodbEnhancer.HELP_MSG = "\
Your config shold have following fields. \n\n\
  { \n\
    mongoose: require('mongoose'), \n\
    server: { \n\
      uri: URI, \n\
      username/user: optional, \n\
      password/pass: optional \n\
    } \n\
  } \n\n\
  PS: we need to use the same mongoose as in the main app";

(function(){

    this.resolveConfig = function(plugin, base){
        if(!plugin.server){
            console.log(MongodbEnhancer.HELP_MSG);
            throw new Error("Archiejs mongodb enhancer plugin should specify a server.");
        }

        if(!plugin.mongoose) {
            plugin.mongoose = require('./peer_dependencies').mongoose;
        }

        this.super.resolveConfig.call(this, plugin, base);
        this.mongoose = plugin.mongoose;
        this.mongoConfig = {
            uri: plugin.server.uri,
            options: plugin.server.options || {},
            // Enable mongoose debug mode
            debug: plugin.debug || process.env.MONGODB_DEBUG || false,
            useMongoClient: true
        };
    };

    this.setupPlugin = async function(plugin, imports){
        debug('mongo: setupPlugin');
        await this.openClient()
        const result = await this.super.setupPlugin.call(this, plugin, imports);
        return result;
    };

    this.openClient = async function(){
        debug('mongo: openClient');
        if(!this.mongoConfig.uri){
            console.log(MongodbEnhancer.HELP_MSG);
            throw new Error("Archiejs mongodb enhancer plugin should have uri.");
        }
        this.db = await this.mongoose.connect(this.mongoConfig.uri, this.mongoConfig.options)
        this.mongoose.set('debug', this.mongoConfig.debug);
        debug('mongo: mongoose connected');
    };

    this.closeClient = async function(){
        debug('mongo: closeClient');
        await this.mongoose.disconnect()
        console.info('Disconnected from mongodb');
    };

    this.getClient = function(cb){
        debug('mongo: getClient');
        return this.db;
    };

}).call(MongodbEnhancer.prototype);

module.exports = MongodbEnhancer;
