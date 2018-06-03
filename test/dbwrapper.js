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

    afterEach(async function (){
        await mongoEnhancer.closeClient();
    });

    it('#reads/writes to mongodb', async function(){
        mongoEnhancer.resolveConfig(configTest, basedir);
        configTest.provides.length.should.equal(1);
        configTest.enhancers.should.have.property('Person');
        
        var dbService = await mongoEnhancer.setupPlugin(configTest);

        // write data
        var person = new dbService.Person({
            name: 'dolly',
            age: 2
        });
        await person.save();

        var data = await dbService.Person.findOne({name: 'dolly'}).exec();
        expect(data._id).to.exist;
        data.name.should.equal('dolly');
        data.age.should.equal(2);
    });

});
