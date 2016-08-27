'use strict';

require('./../');

var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
var promisify = require("es6-promisify");

var pathResolve = require('path').resolve;
var basedir = pathResolve(__dirname, '..');

var MongoEnhancer = require('./../lib/mongo_enhancer');
var mongoEnhancer;

var configTest = {
    packagePath: 'test',
    provides: {
        'Person': 'schema.js'
    },
    mongoose: require('mongoose'),
    server: {
        uri: 'mongodb://localhost/testDB'
    },
    debug: true
};

describe('Mongo Enhancer Testcases:', function(){

    before(function(){
        mongoEnhancer = new MongoEnhancer();
    });

    afterEach(function(){
        mongoEnhancer.closeClient();
    });

    it('#reads/writes to mongodb', function(done){
        var db = {};

        Promise.resolve()
            .then(() => {
                mongoEnhancer.resolveConfig(configTest, basedir);
                configTest.provides.length.should.equal(1);
                configTest.enhancers.should.have.property('Person');
            })
            .then(() => mongoEnhancer.setupPlugin.call(mongoEnhancer, configTest))
            .then((_db) => { db = _db; })
            .then(() => {
                // write data
                var person = new db.Person({
                    name: 'dolly',
                    age: 2
                });
                return promisify(person.save, person)();
            })
            .then(() => {
                // read data
                return promisify(db.Person.findOne, db.Person)({name: 'dolly'});
            })
            .then((data) => {
                expect(data._id).to.exist;
                data.name.should.equal('dolly');
                data.age.should.equal(2);
            })
            .then(done);

    });

});
