var cache = require('persistent-cache');
var globals = cache();
var colors = require("colors/safe");
var authService = require('../service/authService');
var prompt = require('prompt');
var asciify = require('asciify');
var chalk = require('chalk');

module.exports = (args, options, logger) => {

    asciify('Skaffolder-CLI', 'big', function (err, text) {
        console.log(text);

        prompt.message = colors.green("Skaffolder");
        prompt.start();

        var schema = {
            properties: {
                email: {
                    description: 'Insert your Skaffolder credentials\n    You can register for free here ' + colors.yellow("https://app.skaffolder.com/#!/register") + '\n    Insert your account mail',
                    required: true
                },
                password: {
                    hidden: true,
                    required: true,
                    description: 'Insert your password'
                }
            }
        };

        prompt.get(schema, function (err, result) {
            authService.login(result.email, result.password, function (err, res) {
                if (!err && res.token) {
                    globals.putSync("token", res.token);
                    logger.info(chalk.green("✔  Login successful"));
                    logger.info("Try to run: " + chalk.green("'sk new'"));
                } else {
                    logger.error("Credentials not valid");
                }
            });
        });
    });
}