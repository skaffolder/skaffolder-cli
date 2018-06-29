var chalk = require('chalk');
var colors = require('colors');
var prompt = require('prompt');

exports.start = function (options, cb) {

    // INIT


    prompt.message = colors.green("Skaffolder");
    prompt.start();

    var schema = {
        properties: {
            response: {
                description: options.description + options.list.reduce(function (result, option, i) {
                    return result + "\n" + chalk.yellow(i + ") ") + option.description;
                }, "") + "\n\nType number",
                required: true,
                message: 'Response must be a number between 0 and ' + (options.list.length - 1),
                pattern: /^[0-9]+$/,
                conform: function (value) {
                    return value >= 0 && value < options.list.length;
                }
            }
        }
    };

    //options.list;

    // ASK NAME
    prompt.get(schema, function (err, result) {
        cb(options.list[result.response]);
    });

}