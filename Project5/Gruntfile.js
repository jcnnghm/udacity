module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-css');
    grunt.loadNpmTasks('grunt-usemin');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: ['Gruntfile.js', 'src/**/*.js']
        },
        csslint: {
            production: {
                src: 'css/main.css'
            }
        },
        copy: {
            production: {
                src: 'index.html',
                dest: '.tmp/index.html'
            }
        },
        useminPrepare: {
            html: 'index.html'
        },
        usemin: {
            html: '.tmp/index.html'
        },
        htmlmin: {
            production: {
                options: {
                  removeComments: true,
                  collapseWhitespace: true
                },
                files: {
                    'dist/index.html': '.tmp/index.html'
                }
           }
        }
    });

    grunt.registerTask('default', [
        'jshint',
        'csslint',
        'copy',
        'useminPrepare',
        'concat:generated',
        'uglify:generated',
        'cssmin:generated',
        'usemin',
        'htmlmin'
    ]);
};