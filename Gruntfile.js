'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jsdoc: {
            dist : {
                src: ['*.js', 'test/*.js'],
                options: {
                    destination: 'doc',
                    template:"node_modules/grunt-jsdoc/node_modules/ink-docstrap/template",
                    configure : "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template/jsdoc.conf.json"
                }
            }
        },

        codeclimate: {
            options: {
                file: "coverage/lcov.info",
                token: ""
            }
        },

        jshint: {
            all: 'index.js',
            options:{
                jshintrc: '.jshintrc'
            }
        },

        clean: {
            coverage: {
                src: ['coverage']
            }
        },
        mochaTest: {
            quick:{
                options: {
                    reporter: 'spec'
                },
                src: ['test/*.js']
            },
            cover:{
                options:{
                    reporter: 'spec'
                },
                src: ['coverage/instrument/*.js']
            }
        },

        mocha_istanbul: {
            coverage: {
                src: 'test', // a folder works nicely
                options: {
                    mask: '*.js'
                }
            }
        },
        publish: {
            main: {
                src: '*'
            }
        }
    });

    //Load tasks
    require('load-grunt-tasks')(grunt);

    //Test task
    grunt.registerTask('test', ['mochaTest']);

    //Documentation
    grunt.registerTask('doc', ['jsdoc']);

    //Coverage
    grunt.registerTask('coverage', ['jshint', 'clean:coverage', 'mocha_istanbul:coverage']);

    //Publish
    grunt.registerTask('publish', ['clean:coverage', 'jshint', 'mocha_istanbul:coverage']);

    // Default task(s).
    grunt.registerTask('default', ['mochaTest']);
};
