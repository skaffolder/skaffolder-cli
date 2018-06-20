module.exports = function (grunt) {

    grunt.initConfig({
        clean: [
            '.skaffolder',
            'build',
            'cache'
        ],
        obfuscator: {
            options: {
                // global options for the obfuscator
            },
            task1: {
                options: {
                    // options for each sub task
                },
                files: {
                    './': [
                        './generator/GeneratorBean.js',
                        './generator/GeneratorUtils.js',
                    ]
                }
            }
        },
        publish: {
            main: {
                options: {
                    ignore: ['node_modules', '.skaffolder', "cache", "build", "Gruntfile.js"]
                },
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-obfuscator');

    grunt.registerTask('deploy', ['clean', 'obfuscator']);

}