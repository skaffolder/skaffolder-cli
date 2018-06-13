var cache = require('persistent-cache');
var globals = cache();
var colors = require("colors/safe");
var authService = require('../service/authService');
var prompt = require('prompt');
var asciiArt = require('ascii-art');
var chalk = require('chalk');

module.exports = (args, options, logger) => {

    asciiArt.font('Skaffolder-CLI', 'Doom', function (text) {
        console.log(text);

        prompt.message = colors.green("Skaffolder");
        prompt.start();

        var schema = {
            properties: {
                email: {
                    description: 'Insert your email account from https://www.skaffolder.com',
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
                    logger.info("Try to run: sk new project");
                } else {
                    let logger = require("winston-color");
                    logger.error("Credentials not valid");
                }
            });
        });
    });
}