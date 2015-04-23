/*
 * node-mobility-uuid-identifier
 * https://github.com/sayden/node-mobility-uuid-identifier
 *
 * Copyright (c) 2015 Mario Castro
 * Licensed under the MIT license.
 */

'use strict';

var recursive = require('recursive-readdir');
var _ = require('underscore');
var fs = require('fs');
var xmldoc = require('xmldoc');
var Q = require('q');

/** GLOBALS ---------------------------------------------------------------------------------------- */
var ANDROID = 1;
var IOS = 2;
var WINDOWS_PHONE = 3;
var NOT_RECOGNIZED = 4;
var logging = false;
var workingDirectory = './';

/**
 * TODO Comment
 * @param {string} folderPath
 * @returns {promise|Q.promise}
 */
exports.getUniqueIdentifier = function (folderPath) {
    var self = this;
    var defer = Q.defer();

    this.getProjectType(folderPath).then(function (projectType) {
        switch (projectType) {
            case ANDROID:
                return self.getAndroidPackageName(folderPath).then(function(uid){
                    defer.resolve(uid);
                }).catch(defer.reject);
                break;
            case IOS:
                return  self.getBundleidiOS(folderPath).then(function(uid){
                    defer.resolve(uid);
                }).catch(defer.reject);
                break;
            case self.WINDOWS_PHONE:
                //TODO Add code to get unique identifiers of WP projects
                return defer.reject(new Error('Windows phone project are not implemented yet'));
                break;
            default:
                return defer.reject(new Error('Uncaught error when trying to get unique idenfier for project'));
        }
    }).catch(defer.reject);

    return defer.promise;
};

/**
 * TODO Comment
 * @param folderPath
 * @returns {promise|Q.promise}
 */
exports.getProjectType = function (folderPath) {
    var self = this;
    var defer = Q.defer();

    this.isIosProject(folderPath).then(function (isiOS) {
        if (isiOS) {
            printInfo('Project recognized as iOS');
            defer.resolve(IOS);
        } else {
            return self.isAndroidProject(folderPath);
        }
    }).then(function (isAndroid) {
        if (isAndroid) {
            printInfo('Project recognized as Android');
            defer.resolve(ANDROID);
        } else {
            return self.isWindowsPhoneProject(folderPath);
        }
    }).then(function (isWindowsPhone) {
        if (isWindowsPhone) {
            printInfo('Project recognized as Windows Phone');
            defer.resolve(ANDROID);
        } else {
            defer.resolve(NOT_RECOGNIZED);
        }
    }).catch(function (err) {
        printError('Project not recognized: ' + err);
        defer.resolve(NOT_RECOGNIZED);
    });

    return defer.promise;
};

/**
 * TODO Comment
 * @param {string} filename
 * @param {path} path
 * @returns {promise|Q.promise}
 */
exports.getFilePath = function(filename, path){
    var defer = Q.defer();

    recursive('"' + path + '"', function (err, filesArray) {
        if(err) return defer.reject(filesArray);

        _.find(filesArray, function(file){
            if (file.indexOf(filename) != -1) {
                console.log(file);
                return defer.resolve(file);
            }
        });

        return defer.reject(new Error('File not found'));
    });

    return defer.promise;
};

exports.getBundleidiOS = function (projectPath, cb) {
    var self = this;
    var defer = Q.defer();
    var infoPlistPath, pbxFilePath, productName;

    this.getFilePath('.plist', projectPath)
      .then(function(_infoPlistPath) {
            infoPlistPath = _infoPlistPath;
            console.log('plist', infoPlistPath);
            return self.getFilePath('.pbxproj', projectPath);

    }).then(function(_pbxFilePath) {
            pbxFilePath = _pbxFilePath;
            return execPromise('cat ' + pbxFilePath + ' | grep productName');

    }).then(function(res){
            var productStartIndex = res.res.indexOf('= ');
            var productEndIndex = res.res.indexOf(';');
            productName = res.res.substring(productStartIndex + 2, productEndIndex);
            return execPromise("/usr/libexec/PlistBuddy -c 'Print CFBundleIdentifier' " + infoPlistPath);

    }).then(function(res){
            var packageStart = res.res.indexOf('$');
            var packageName = res.res.substring(0, packageStart);
            var bundleId = packageName + productName;

            defer.resolve(bundleId);

    }).catch(defer.reject);

    return defer.promise;
};


/**
 * TODO Comment
 * @param {string} folderPath
 * @returns {promise|Q.promise}
 */
exports.getAndroidPackageName = function (folderPath) {
    var defer = Q.defer();

    recursive(folderPath, function (err, filesArray) {

        for (var i = 0; i < filesArray.length; i++) {
            var file = filesArray[i];

            if (file.indexOf('anifest.xml') != -1) {
                var fileContent = fs.readFileSync(file);
                var doc = new xmldoc.XmlDocument(fileContent);

                defer.resolve(doc.attr.package);
            }
        }

        return defer.reject(new Error('No attribute package found'));
    });

    return defer.promise;
};


/**
 * TODO Comment
 * @param projectPath
 * @returns {promise|Q.promise}
 */
exports.getInfoPlistRelative = function (projectPath) {
    return this.getFilePath('.plist', projectPath);
};

/**
 * TODO Comment
 * @param {string} folderPath
 * @returns {*}
 */
exports.isAndroidProject = function (folderPath) {
    var defer = Q.defer();

//    return this.fileStringExistsOnFolder('anifest.xml', folderPath);
    this.getFilePath('anifest.xml', folderPath).then(function(filePath){
        var fileExists = (filePath != undefined);
        return defer.resolve(fileExists);

    }).catch(function(err){
        return defer.reject(err);
    });

    return defer.promise;
};

/**
 * TODO Comment
 * @param {string} folderPath
 * @returns {*}
 */
exports.isIosProject = function (folderPath) {
    var defer = Q.defer();

//    return this.fileStringExistsOnFolder('.xcodeproj', folderPath);
    this.getFilePath('.xcodeproj', folderPath).then(function(filePath){
        var fileExists = (filePath != undefined);
        return defer.resolve(fileExists);

    }).catch(function(err){
        return defer.reject(err);
    });

    return defer.promise;
};

/**
 * TODO Comment
 * @param {string} folderPath
 * @returns {*}
 */
exports.isWindowsPhoneProject = function (folderPath) {
    //TODO Find a Windows Phone project to use it against this function
    return this.fileStringExistsOnFolder('somethingOfWpProject.extension', folderPath);
};

/**
 * TODO Comment
 * @param {string} msg
 */
var printInfo = function (msg) {
    if (logging) {
        console.info(msg);
    } else {
        //Do not log anything
    }
};

/**
 * TODO Comment
 * @param {string} msg
 */
var printError = function (msg) {
    if (logging) {
        console.error(msg);
    } else {
        //Do not log anything
    }
};


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