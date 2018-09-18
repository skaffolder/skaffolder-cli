var cache = require('persistent-cache');
var properties = require('../properties');
var configUtils = require('../utils/config');
var validator = require('../utils/validator');
var chalk = require('chalk');
var globals = cache();


module.exports = (args, options, logger) => {

    if (args.opt && args.opt.indexOf("endpoint:") == 0) {
        globals.putSync("endpoint", args.opt.replace('endpoint:', ''));
        logger.info(chalk.green("Set endpoint on-premise"))
        return;
    }

    // VALIDATOR
    if (!validator.isSkaffolderFolder()) return;

    var config = configUtils.getConf();
    logger.info(chalk.green("To manage data models, APIs and pages of your project, visit this URL:"))
    logger.info(chalk.yellow(properties.endpoint + "/#!/projects/" + config.project + "/design/models"));
}