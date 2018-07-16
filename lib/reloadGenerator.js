var generatorUtils = require('../utils/generator');
var configUtils = require('../utils/config');
var validator = require('../utils/validator');
var chalk = require('chalk');
var properties = require('../properties');

module.exports = (args, options, logger) => {

    // VALIDATOR
    if (!validator.isSkaffolderFolder()) return;

    var config = configUtils.getConf()
    generatorUtils.loadGenerator(config.project, config.generator, () => {
        logger.info(chalk.green("✔  Generator file imported in ./.skaffolder/template"));
        logger.info(chalk.blue("You can edit your project structure at ") + chalk.yellow(properties.endpoint + "/#!/projects/" + config.project + "/design/models"));
        process.exit(0);
    });
}