var config = require('../utils/config')
var chalk = require('chalk');
var cache = require('persistent-cache');
var globals = cache();

exports.isSkaffolderFolder = function () {
    if (config.getConf().project) return true

    console.error(chalk.red("You need to run this command from a Skaffolder project folder"));
    console.error(chalk.red("Run 'sk new project' to create a new project"));
    return false;
}

exports.isLogged = function () {
    var token = globals.getSync("token");
    if (token) return true

    console.error(chalk.red("You should be logger to run this command"));
    console.error(chalk.red("Run 'sk login' to login"));
    return false;
}