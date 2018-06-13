var request = require('request');
var cache = require('persistent-cache');
var globals = cache();
var token = globals.getSync("token");
let logger = require("winston-color");
var chalk = require('chalk');

module.exports = function (options, cb) {

    if (!options.headers)
        options.headers = {}
    if (token && !options.public)
        options.headers.Token = token;

    request(options, function (error, response, body) {
        //logger.debug(error, body);

        if (error) {
            error = {
                message: error.code
            };
            logger.error(chalk.red(error.message));
        } else if (body && body.message == "Not Authoized") {
            error = {
                message: "Not Authoized"
            };
            logger.error(chalk.red(error.message));
        } else if (response.statusCode == 401) {
            error = {
                message: "You should loging with command: 'sk login'"
            };
            logger.error(chalk.red(error.message));
        } else if (response.statusCode == 404) {
            error = {
                message: "URL not found"
            };
            logger.error(chalk.red(body));
        } else if (response.statusCode != 200) {
            error = {
                message: "ERROR " + response.statusCode
            };
            logger.error(chalk.red(error.message));
        }

        try {
            cb(error, JSON.parse(body));
        } catch (e) {
            cb(error, body);
        }
    });

}