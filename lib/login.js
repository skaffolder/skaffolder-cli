var cache = require('persistent-cache');
var globals = cache();
var colors = require("colors/safe");
var authService = require('../service/authService');
var prompt = require('prompt');
var asciify = require('asciify');
var chalk = require('chalk');
var opn = require('opn');
var crypto = require('crypto');
var properties = require('../properties');

module.exports = (args, options, logger) => {

    asciify('Skaffolder-CLI', 'big', function (err, text) {
        console.log(text);

        prompt.message = colors.green("Skaffolder");
        prompt.start();

        // Connect to server
        var token = crypto.randomBytes(64).toString('hex');
        var socket = require('socket.io-client')(properties.endpoint, {
            timeout: 30,
            reconnection: false,
            query: 'token=' + token
        });

        socket.on('connect_error', function (err) {
            console.error(chalk.red("Server not available"));
        })

        // Connected
        socket.on('connect', function () {
            console.error(chalk.yellow("Login from your browser"));
            var url = properties.endpoint + '/#!/login?from=cli&token=' + token;

            opn(url, {
                wait: false
            });

            socket.on('login', function (tokenLogin) {
                if (tokenLogin) {
                    globals.putSync("token", tokenLogin);
                    logger.info(chalk.green("✔  Login successful"));
                    logger.info("Try to run: " + chalk.green("'sk new'"));
                    process.exit(0);
                } else {
                    logger.error("Credentials not valid");
                }
            });
        });


        // var schema = {
        //     properties: {
        //         email: {
        //             description: 'Insert your Skaffolder credentials\n    You can register for free here ' + colors.yellow("https://app.skaffolder.com/#!/register") + '\n    Insert your account mail',
        //             required: true
        //         },
        //         password: {
        //             hidden: true,
        //             required: true,
        //             description: 'Insert your password'
        //         }
        //     }
        // };

        // prompt.get(schema, function (err, result) {
        //     authService.login(result.email, result.password, function (err, res) {
        //         if (!err && res.token) {
        //             globals.putSync("token", res.token);
        //             logger.info(chalk.green("✔  Login successful"));
        //             logger.info("Try to run: " + chalk.green("'sk new'"));
        //         } else {
        //             logger.error("Credentials not valid");
        //         }
        //     });
        // });
    });
}