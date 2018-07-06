var request = require('request');
var cache = require('persistent-cache');
var globals = cache();
var token = globals.getSync("token");
var chalk = require('chalk');

module.exports = function (options, cb) {

    if (!options.headers)
        options.headers = {}
    if (token && !options.public)
        options.headers.Token = token;

    request(options, function (error, response, body) {
        //console.debug(error, body);

        if (error) {
            error = {
                message: error.code
            };
            console.error(chalk.red(error.message));
            process.exit(0);
        } else if (body && body.message == "Not Authoized") {
            error = {
                message: "Not Authoized"
            };
            console.error(chalk.red(error.message));
        } else if (response.statusCode == 401) {
            error = {
                message: "You should loging with command: 'sk login'"
            };
            console.error(chalk.red(error.message));
        } else if (response.statusCode == 405) {
            error = {
                message: "User not allowed\r\nYou should loging with command: 'sk login'"
            };
            console.error(chalk.red(error.message));
        } else if (response.statusCode == 403) {
            error = {
                message: "Nor permitted: " + body.message
            };
            console.error(chalk.red(error.message));
            console.error(chalk.blue("Please visit " + chalk.yellow("https://app.skaffolder.com/#!/upgrade")));
        } else if (response.statusCode == 404) {
            error = {
                message: "URL not found"
            };
            console.error(chalk.red(body));
        } else if (response.statusCode != 200) {
            error = {
                message: "ERROR " + response.statusCode
            };
            console.error(chalk.red(error.message));
        }

        try {
            body = JSON.parse(body);
        } catch (e) {
            //console.log(chalk.yellow(e));
        }
        cb(error, body);
    });

}