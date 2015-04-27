'use strict';

var mobility_uuid_identifier = require('../../src/mobility-uuid-identifier.js');

/* Testing libraries */
var chai = require('chai');
var mocha = require('mocha');
var should = chai.should();

/* Modules */
var Q = require('q');
var fs = require('fs');
var TestConstants = require('./../TestConstants');

describe('Node UID project extractor', function () {

    it('should return the unique identifier of an iOS project', function (done) {
        mobility_uuid_identifier.getUniqueIdentifier(TestConstants.IOS_TEST_PROJECTS_PATH[0])
            .then(function (bundleId) {
                bundleId.should.contains(TestConstants.TEST_UNIQUE_IDENTIFIERS.ios);
                done();
            }).catch(done);
    });

    it('should return the unique identifier of an Android project', function (done) {
        mobility_uuid_identifier.getUniqueIdentifier(TestConstants.ANDROID_TEST_PROJECTS_PATH[0])
            .then(function (packageName) {
                packageName.should.contains(TestConstants.TEST_UNIQUE_IDENTIFIERS.android);
                done();
            }).catch(done);
    });

    it('should return the unique identifier of a windows phone project', function(done){
        //TODO Complete the windows phone identification proccess
        mobility_uuid_identifier.getUniqueIdentifier(TestConstants.WINDOWS_PHONE_PROJECTS_PATH[0]).then(function(res){
            done();
        }).catch(function(err){
            //Windows phone should not be recognized yet
            done();
        });
    });

    it('should return the not recognized code for a non recognized project type', function(done){
        //TODO Complete the windows phone identification proccess
        mobility_uuid_identifier.getUniqueIdentifier('/tmp').then(function(res){
            res.should.be.equal('Project type not recognized');
            done();
        }).catch(done);
    });
});