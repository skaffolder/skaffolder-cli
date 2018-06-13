var generatorUtils = require('../utils/generator');
var fs = require('fs');

module.exports = (args, options, logger) => {
    let config = fs.readFileSync('.skaffolder/config.json');
    config = JSON.parse(config);

    generatorUtils.importGenerator(config.project, config.generator, () => {
        logger.info("Generator file imported");
    });
}