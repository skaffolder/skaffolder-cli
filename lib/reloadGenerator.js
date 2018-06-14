var generatorUtils = require('../utils/generator');
var fs = require('fs');
var config = require('../utils/config').getConf();
var validator = require('../utils/validator');
var chalk = require('chalk');

module.exports = (args, options, logger) => {

    // VALIDATOR
    if (!validator.isSkaffolderFolder()) return;

    generatorUtils.importGenerator(config.project, config.generator, () => {
        logger.info(chalk.green("✔  Generator file imported in ./.skaffolder/template"));
        process.exit(0);
    });
}