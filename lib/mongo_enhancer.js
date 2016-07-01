'use strict';

var debug = require('debug')('archiejs-mongo-enhancer');

// TODO fix bug in deep inheritence
var DbEnhancer = require('./db_base_enhancer');

var MongodbEnhancer = function(){
    DbEnhancer.call(this); // override functions
    this.enhancerName = "mongodb-enhancer";
    this.baseEnhancer.__registerClass = true;
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
            debug: plugin.debug || process.env.MONGODB_DEBUG || false
        };
    };

    this.setupPlugin = function(plugin, imports){
        debug('mongo: setupPlugin');
        var me = this;
        var result = this.openClient()
                   .then(() => me.super.setupPlugin.call(me, plugin, imports));
        return result;
    };

    this.openClient = function(){
        debug('mongo: openClient');
        var me = this;
        if(!this.mongoConfig.uri){
            console.log(MongodbEnhancer.HELP_MSG);
            throw new Error("Archiejs mongodb enhancer plugin should have uri.");
        }
        return new Promise((resolve, reject) => {
            this.db = this.mongoose.connect(this.mongoConfig.uri, this.mongoConfig.options,
                function(err){
                    if(err){
                        console.error('Could not connect to mongodb');
                        //console.log(err);
                        reject(err);
                    } else {
                        me.mongoose.set('debug', me.mongoConfig.debug);
                        debug('mongo: mongoose connected');
                        resolve();
                    }
                });
        });
    };

    this.closeClient = function(){
        debug('mongo: closeClient');
        return new Promise((resolve, reject) => {
            this.mongoose.disconnect(function(err){
                if(err)
                    return reject(err);

                console.info('Disconnected from mongodb');
                resolve();
            });
        });
    };

    this.getClient = function(cb){
        debug('mongo: getClient');
        return this.db;
    };

}).call(MongodbEnhancer.prototype);

module.exports = MongodbEnhancer;
