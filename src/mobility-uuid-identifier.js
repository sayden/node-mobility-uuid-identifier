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
var WINDOWS_PHONE;
var NOT_RECOGNIZED = 4;
var logging = true;

/**
 * TODO Comment
 * @param {string} folderPath
 * @returns {promise|Q.promise}
 */
exports.getUniqueIdentifier = function (folderPath) {
    var defer = Q.defer();

    this.getProjectType(folderPath).then(function (projectType) {
        switch (projectType) {
            case ANDROID:
                return getAndroidPackageName(folderPath).then(function (uid) {
                    defer.resolve(uid);
                }).catch(defer.reject);
            case IOS:
                return getBundleIdiOS(folderPath).then(function (uid) {
                    defer.resolve(uid);
                }).catch(defer.reject);
            case WINDOWS_PHONE:
                //TODO Add code to get unique identifiers of WP projects
                return defer.reject(new Error('Windows phone project are not implemented yet'));
            default:
                return defer.reject(new Error('Uncaught error when trying to get unique idenfier for project: Project type not recognized'));
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
    var defer = Q.defer();

    isIosProject(folderPath).then(function(isIOS){
        if (isIOS){
            printInfo('Project recognized as iOS project');
            defer.resolve(IOS);
        } else {
            isAndroidProject(folderPath).then(function(isAndroid){
                if(isAndroid) {
                    printInfo('Project recognized as Android project');
                    defer.resolve(ANDROID);
                } else {
                    isWindowsPhoneProject(folderPath).then(function(isWindowsPhone){
                        if(isWindowsPhone){
                            defer.resolve(WINDOWS_PHONE);
                        } else {
                            defer.resolve(NOT_RECOGNIZED);
                        }
                    }).catch(defer.reject)
                }
            }).catch(defer.reject)
        }
    }).catch(defer.reject);

    return defer.promise;
};

/**
 * TODO Comment
 * @param {string} filename
 * @param {path} path
 * @returns {promise|Q.promise}
 */
var getFilePath = function (filename, path) {
    var defer = Q.defer();
    recursive(path, function (err, filesArray) {
        if (err) {
            return defer.reject(new Error(err));
        } else {
            _.find(filesArray, function (file) {
                if (file.indexOf(filename) != -1) {
                    return defer.resolve(file);
                }
            });

            return defer.resolve(false);
        }
    });

    return defer.promise;
};

var getBundleIdiOS = function (projectPath, cb) {
    var defer = Q.defer();
    var infoPlistPath, pbxFilePath, productName;

    getFilePath('.plist', projectPath)
        .then(function (_infoPlistPath) {
            infoPlistPath = _infoPlistPath;
            return getFilePath('.pbxproj', projectPath);

        }).then(function (_pbxFilePath) {
            pbxFilePath = _pbxFilePath;
            return execPromise('cat "' + pbxFilePath + '" | grep productName');

        }).then(function (res) {
            var productStartIndex = res.res.indexOf('= ');
            var productEndIndex = res.res.indexOf(';');
            productName = res.res.substring(productStartIndex + 2, productEndIndex);
            return execPromise('/usr/libexec/PlistBuddy -c "Print CFBundleIdentifier" "' + infoPlistPath + '"');

        }).then(function (res) {
            var packageStart = res.res.indexOf('$');    //TODO Product name maybe is not obfuscated
            var packageName = res.res.substring(0, packageStart);
            var bundleId = packageName + productName;

            /* Check if the bundle has spaces (which xCode automatically converts into dashes
             * Delete double quotes for the same reason too
             */
            bundleId = bundleId.replace(/ +/g, '-');
            bundleId = bundleId.replace(/['"]+/g, '');

            printInfo('iOS bundle id: ' + bundleId);

            defer.resolve(bundleId);

        }).catch(defer.reject);

    return defer.promise;
};


/**
 * TODO Comment
 * @param {string} folderPath
 * @returns {promise|Q.promise}
 */
var getAndroidPackageName = function (folderPath) {
    var defer = Q.defer();

    recursive(folderPath, function (err, filesArray) {

        for (var i = 0; i < filesArray.length; i++) {
            var file = filesArray[i];

            if (file.indexOf('anifest.xml') != -1) {
                var fileContent = fs.readFileSync(file);
                var doc = new xmldoc.XmlDocument(fileContent);

                printInfo("Android package recognized in " + file);
                defer.resolve(doc.attr.package);
                break;
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
var getInfoPlistRelative = function (projectPath) {
    printInfo('.plist found in '+ projectPath);
    return getFilePath('.plist', projectPath);
};

/**
 * TODO Comment
 * @param {string} folderPath
 * @returns {*}
 */
var isAndroidProject = function (folderPath) {
    var defer = Q.defer();

    getFilePath('anifest.xml', folderPath).then(function (filePath) {
        var fileExists = (filePath != undefined);
        return defer.resolve(fileExists);

    }).catch(function (err) {
        return defer.reject(err);
    });

    return defer.promise;
};

/**
 * TODO Comment
 * @param {string} folderPath
 * @returns {*}
 */
var isIosProject = function (folderPath) {
    var defer = Q.defer();

    getFilePath('.xcodeproj', folderPath).then(function (filePath) {
        var fileExists = !!filePath;
        return defer.resolve(fileExists);

    }).catch(function (err) {
        return defer.reject(err);
    });

    return defer.promise;
};

/**
 * TODO Comment
 * @param {string} folderPath
 * @returns {*}
 */
var isWindowsPhoneProject = function (folderPath) {
    //TODO Find a Windows Phone project to use it against this function
    return getFilePath('somethingOfWpProject.extension', folderPath);
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
            defer.resolve({res: stdout, out: stderr});
        }
    });

    return defer.promise;
};

/* TESTING HELPERS */
if(process.env.NODE_ENV === 'test'){
    exports.execPromise = execPromise;
    exports.getBundleIdiOS = getBundleIdiOS;
    exports.getFilePath = getFilePath;
    exports.getAndroidPackageName = getAndroidPackageName;
    exports.getInfoPlistRelative = getInfoPlistRelative;
    exports.isAndroidProject = isAndroidProject;
    exports.isIosProject = isIosProject;
    exports.isWindowsPhoneProject = isWindowsPhoneProject;
    exports.printInfo = printInfo;
    exports.printError = printError;
} else {
    //Do not export more than already exported functions
}