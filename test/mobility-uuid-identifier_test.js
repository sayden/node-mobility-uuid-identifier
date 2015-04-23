'use strict';

var mobility_uuid_identifier = require('../lib/mobility-uuid-identifier.js');

/* Testing libraries */
var chai = require('chai');
var mocha = require('mocha');
var should = chai.should();
var Q = require('q');

// iOS project
var iOsFileToSearch = '.xcodeproj';
var iOsProjectPath = '/Users/mariocastro/testProject';

// Android project
var androidProjectPath = '/Users/mariocastro/app-demo-android';

describe('Node UID project extractor', function(){

    it('should return the path of a filename within an specified path', function(done){
        mobility_uuid_identifier.getFilePath(iOsFileToSearch, iOsProjectPath).then(function(filePath){
            filePath.indexOf(iOsFileToSearch).should.not.be.equals(-1);
            done();
        }).catch(done);
    });

    it('should return a true for an iOS project', function(done){
        mobility_uuid_identifier.isIosProject(iOsProjectPath).then(function(isIOS){
            isIOS.should.not.be.null;
            done();
        }).catch(done);
    });

    it('should return a true for an Android project', function(done){
        mobility_uuid_identifier.isAndroidProject(androidProjectPath).then(function(isAndroid){
            isAndroid.should.not.be.null;
            done();
        }).catch(done);
    });

    it('should return the android package name', function(done){
        mobility_uuid_identifier.getAndroidPackageName(androidProjectPath).then(function(packageName){
            packageName.should.contains('com.');
            done();
        }).catch(done);
    });

    it('should return the path to the info.plist file', function(done){
        mobility_uuid_identifier.getInfoPlistRelative(iOsProjectPath).then(function(res){
            res.indexOf('.plist').should.not.be.equals(-1);
            done();
        }).catch(done);
    });

    it.only('should return the ios bundleId', function(done){
        mobility_uuid_identifier.getBundleidiOS('/tmp/temp').then(function(bundleId){
            bundleId.should.be.a.string;
//            bundleId.should.contains('atsistemas.');
            console.log(bundleId);
            done();
        }).catch(done);
    });

    it('should return the bundleId of an iOs project', function(done){
        //clone the repo
        execPromise('git clone https://github.com/owncloud/ios.git /tmp/temp', {cwd:'/tmp'}).then(function(res){
            return mobility_uuid_identifier.getBundleidiOS('/tmp/temp');
        }).then(function(bundleId){
            bundleId.should.be.a.string;
            console.log(bundleId);
            done();
        }).catch(done);
    })

});

/**
 * Main function to use the command line tools to execute git commands
 * @param command   Command to execute. Do not include 'git ' prefix
 * @param options   Options available in exec command https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback
 * @returns {promise|*|Q.promise}
 */
var execPromise = function (command, options) {
    var exec = require('child_process').exec;
    var defer = Q.defer();

    exec(command, options, function (err, stdout, stderr) {
        if (err) {
            defer.reject({err: err, stderr: stderr});
        } else {
            defer.resolve({res:stdout, out:stderr});
        }
    });

    return defer.promise;
};