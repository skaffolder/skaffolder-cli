var generatorUtils = require('../utils/generator');
var fs = require('fs');
var config = require('../utils/config');

module.exports = (args, options, logger) => {
    generatorUtils.importGenerator(config.project, config.generator, () => {
        logger.info("Generator file imported");
    });
}