var projectService = require('../service/projectService');
var generatorBean = require('../generator/generatorBean');
var config = require('../utils/config').getConf();
var validator = require('../utils/validator');
var chalk = require('chalk');
var properties = require('../properties');

module.exports = (args, options, logger) => {

    // VALIDATOR
    if (!validator.isSkaffolderFolder()) return;

    // GET PROJECT
    projectService.getProjectData(config.project, function (err, files) {
        if (err) return;

        generatorBean.generate(files, logger, function () {
            logger.info(chalk.green("✔  Generation complete!"));
            logger.info(chalk.blue("You can edit your project structure at ") + chalk.yellow(properties.endpoint + "/#!/projects/" + config.project + "/design/models"));
            process.exit(0);
        });
    });
}