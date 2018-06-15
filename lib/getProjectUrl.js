var properties = require('../properties');
var configUtils = require('../utils/config');
var validator = require('../utils/validator');
var chalk = require('chalk');

module.exports = (args, options, logger) => {

    // VALIDATOR
    if (!validator.isSkaffolderFolder()) return;

    var config = configUtils.getConf();
    logger.info(chalk.green("To manage data models, APIs and pages of your project, visit this URL:"))
    logger.info(chalk.blue(properties.endpoint + "/#!/projects/" + config.project + "/design/models"));
}