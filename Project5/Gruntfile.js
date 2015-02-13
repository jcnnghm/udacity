module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-css');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: ['Gruntfile.js', 'src/**/*.js']
        },
        uglify: {
            production: {
                files: {
                    'dist/output.min.js': ['bower_components/jquery/dist/jquery.js', 'bower_components/knockout/dist/knockout.js', 'src/app.js']
                }
            }
        },
        csslint: {
            production: {
                src: "css/main.css"
            }
        },
        cssmin: {
            production: {
                src: 'css/main.css',
                dest: 'dist/output.min.css'
            }
        }
    });

    grunt.registerTask('default', ['jshint', 'csslint', 'uglify', 'cssmin']);
};