var generatorUtils = require('../utils/generator');
var fs = require('fs');
var configUtils = require('../utils/config');
var validator = require('../utils/validator');
var chalk = require('chalk');

module.exports = (args, options, logger) => {

    // VALIDATOR
    if (!validator.isSkaffolderFolder()) return;

    var config = configUtils.getConf()
    generatorUtils.importGenerator(config.project, config.generator, () => {
        logger.info(chalk.green("✔  Generator file imported in ./.skaffolder/template"));
        process.exit(0);
    });
}