var config = require('../utils/config').getConf();
var chalk = require('chalk');

exports.isSkaffolderFolder = function () {
    if (config.project) return true

    console.error(chalk.red("You need to run this command from a Skaffolder project folder"));
    console.error(chalk.red("Run 'sk new project' to create a new project"));
}