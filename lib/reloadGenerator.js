var generatorUtils = require('../utils/generator');
var fs = require('fs');
var config = require('../utils/config').getConf();
var validator = require('../utils/validator');

module.exports = (args, options, logger) => {

    // VALIDATOR
    if (!validator.isSkaffolderFolder()) return;

    generatorUtils.importGenerator(config.project, config.generator, () => {
        logger.info("Generator file imported in ./.skaffolder/template");
    });
}