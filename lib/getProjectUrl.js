var properties = require('../properties');
var config = require('../utils/config').getConf();
var validator = require('../utils/validator');
var chalk = require('chalk');

module.exports = (args, options, logger) => {

    // VALIDATOR
    if (!validator.isSkaffolderFolder()) return;

    logger.info(chalk.green("To manage data models, APIs and pages of your project, visit this URL:"))
    logger.info(chalk.blue(properties.endpoint + "/#!/projects/" + config.project + "/design/models"));
}