var cache = require('persistent-cache');
var globals = cache();
var colors = require("colors/safe");
var authService = require('../service/authService');
var prompt = require('prompt');

module.exports = (args, options, logger) => {

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
                logger.info("Login successful");
                logger.info("Try to run: sk new project");
            } else {
                logger.error("Credentials not valid");
            }
        });
    });
}