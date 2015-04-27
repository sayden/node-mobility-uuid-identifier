/**
 * Created by Mario Castro (mcastro@atsistemas.com) on 27/04/15.
 */

/* MODULES */
var mocha = require('mocha');
var mui = require('../../index');
var TestConstants = require('../TestConstants');
var assert = require('chai').assert;

suite('Project recognition', function(){
    test('Recognize folder as Android project', function(done){
        mui.isAndroidProject(TestConstants.ANDROID_TEST_PROJECTS_PATH[0]).then(function(isAndroid){
            assert.isTrue(isAndroid);
            done();
        }).catch(done);
    });

    test('Recognize folder as iOS project', function(done){
        mui.isIosProject(TestConstants.IOS_TEST_PROJECTS_PATH[0]).then(function(isIOS){
            assert.isTrue(isIOS);
        }).catch(done);
        done();
    });

    test('Do not recognize an Android project as an iOS project', function(done){
        mui.isIosProject(TestConstants.ANDROID_TEST_PROJECTS_PATH[0]).then(function(isIOS){
            assert.isFalse(isIOS);
            done();
        }).catch(done);
    });

    test('Do not recognize an iOS project as an Android project', function(done){
        mui.isAndroidProject(TestConstants.IOS_TEST_PROJECTS_PATH[0]).then(function(isAndroid){
            assert.isFalse(isAndroid, 'And ios project should not be recognized as an android project');
            done();
        }).catch(done);
    });

    test('Returns the path to the Info.plist file inside a iOS project', function(done){
        mui.getInfoPlistRelative(TestConstants.IOS_TEST_PROJECTS_PATH[0]).then(function(plistPath){
            assert.isString(plistPath);
            assert.include(plistPath, '.plist');
            done();
        }).catch(done);
    });

    test('Returns the path to the Manifest file inside an Android project', function(done){
        mui.getFilePath('anifest.xml', TestConstants.ANDROID_TEST_PROJECTS_PATH[0]).then(function(filePath){
            assert.isString(filePath);
            assert.include(filePath, 'anifest.xml');
            done();
        }).catch(done);
    });

    test('Returns file not found when searching an plist in an Android project', function(done){
        mui.getFilePath('anifest.xml', TestConstants.ANDROID_TEST_PROJECTS_PATH[0]).then(function(filePath){
            console.log(filePath);
            assert.isString(filePath);
            assert.include(filePath, 'anifest.xml');
            done();
        }).catch(done);
    });

    test('Returns the path of a given string regex within a folder', function(done){
        mui.getFilePath('.plist', TestConstants.IOS_TEST_PROJECTS_PATH[0]).then(function(filePath){
            assert.isString(filePath);
            assert.include(filePath, '.plist');
            done();
        }).catch(done);
    });

    test('execPromise should execute a command line command returning a promise', function(done){
        mui.execPromise('cd /tmp; pwd').then(function(res){
            assert.include(res.res, '/tmp');
            done();
        }).catch(done);
    });

    test('Print error on console when logging enabled', function(done){
        assert.isTrue(mui.getLog(), 'Logging now must be activated');
        mui.printError('An error');
        mui.setLog(false);
        assert.isFalse(mui.getLog(), 'Logging now must be deactivated');
        mui.printError('An error that will not be printed');
        mui.setLog(true);
        assert.isTrue(mui.getLog(), 'Logging now must be activated');
        done();
    });

    test('Print info on console when logging enabled', function(done){
        assert.isTrue(mui.getLog(), 'Logging now must be activated');
        mui.printInfo('An info message');
        mui.setLog(false);
        assert.isFalse(mui.getLog(), 'Logging now must be deactivated');
        mui.printInfo('An info message that will not be printed');
        mui.setLog(true);
        assert.isTrue(mui.getLog(), 'Logging now must be activated');
        done();
    });

    test('Recognize folder as Windows phone', function(done){
        //TODO Assert a windows phone project
        mui.isWindowsPhoneProject(TestConstants.WINDOWS_PHONE_PROJECTS_PATH[0]).then(function(res){
            assert.isFalse(res);
            done();
        })
    });

    test('Returns the package name of an Android project', function(done){
        mui.getAndroidPackageName(TestConstants.ANDROID_TEST_PROJECTS_PATH[0]).then(function(res){
            assert.include(res, TestConstants.TEST_UNIQUE_IDENTIFIERS.android);
            done();
        }).catch(done);
    });

    test('Returns the bundle id of an iOS project', function(done){
        mui.getIosBundleId(TestConstants.IOS_TEST_PROJECTS_PATH[0]).then(function(bundleid){
            assert.include(bundleid, TestConstants.TEST_UNIQUE_IDENTIFIERS.ios);
            done();
        }).catch(done);
    });

    test('Recognizes the project type of a folder with an Android project', function(done){
        mui.getProjectType(TestConstants.ANDROID_TEST_PROJECTS_PATH[0]).then(function(res){
            assert.equal(res, 1);
            done();
        }).catch(done);
    });

    test('behaviour with a wrong path passed to getFilePath', function(done){
        mui.getFilePath('\asdfadf', '\asdasdasd').then(function(res){
            done(new Error('A wrong file path should not return a correct response'));
        }).catch(function(err){
            done();
        });
    });

    test('behaviour with a wrong path passed to isAndroidProject', function(done){
        mui.isAndroidProject('\asdfadf', '\asdasdasd').then(function(res){
            done(new Error('A wrong file path should not return a correct response'));
        }).catch(function(err){
            done();
        });
    });

    test('behaviour with a wrong path passed to isAndroidProject', function(done){
        mui.isIosProject('\asdfadf', '\asdasdasd').then(function(res){
            done(new Error('A wrong file path should not return a correct response'));
        }).catch(function(err){
            done();
        });
    });

    test('behaviour with a wrong path passed to isAndroidProject', function(done){
        mui.isWindowsPhoneProject('\asdfadf', '\asdasdasd').then(function(res){
            done(new Error('A wrong file path should not return a correct response'));
        }).catch(function(err){
            done();
        });
    });

    test('Execution command does not exists', function(done){
       mui.execPromise('asdfasdf').then(function(res){
           done(new Error('An unknown command must throw a reject promise'));
       }).catch(function(err){
           done();
       });
    });
});