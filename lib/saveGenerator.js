var generatorUtils = require('../utils/generator');
var configUtils = require('../utils/config');
var validator = require('../utils/validator');
var chalk = require('chalk');
var properties = require('../properties');
var questionService = require('../utils/questionService');
var projectService = require('../service/projectService');

module.exports = (args, options, logger) => {


    // VALIDATOR
    if (!validator.isSkaffolderFolder()) return;


    var listYN = [{
        description: "Yes",
        value: true
    }, {
        description: "No",
        value: false
    }];

    questionService.ask({
        description: "Do you want to save ./.skaffolder/template folder to Skaffodler platform?\nThis will override any customization on Skaffolder generator on the online platform",
        list: listYN
    }, function (resultOverwrite) {
        if (resultOverwrite.value == true) {

            // get files
            var genFiles = generatorUtils.getGenFiles('./.skaffolder/template');

            // get helpers
            var extra = {};
            try {
                extra = require(process.cwd() + '/extra');

                for (var i in extra.helpers) {
                    extra.helpers[i].fn = extra.helpers[i].fn.toString()
                }
            } catch (e) {}

            var config = configUtils.getConf()
            projectService.saveGenerator(config.generator, genFiles, extra.helpers, function () {
                logger.info(chalk.green("✔  Generator files saved on: "));
                logger.info(chalk.yellow(properties.endpoint + "/#!/projects/" + config.project + "/generators/" + config.generator + "/file"));
            });
        } else {
            process.exit(0);
        }
    });
}