module.exports = function (grunt) {

    grunt.initConfig({
        clean: [
            '.skaffolder',
            'build',
            'cache'
        ],
        publish: {
            main: {
                options: {
                    ignore: ['node_modules', '.skaffolder', "cache", "build", "Gruntfile.js"]
                },
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('deploy', ['clean']);
}