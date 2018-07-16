var generatorUtils = require('../utils/generator');
var validator = require('../utils/validator');
var chalk = require('chalk');
var questionService = require('../utils/questionService');

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
        description: "Do you want to overwrite ./.skaffolder/template folder?",
        list: listYN
    }, function (resultOverwrite) {
        if (resultOverwrite.value == true) {
            generatorUtils.importGenerator();
            logger.info(chalk.green("✔  Generator file imported in ./.skaffolder/template"));
            logger.info(chalk.blue("Now you can customize template files an generate code with " + chalk.green("'sk generate'")));
        } else {
            process.exit(0);
        }
    });
}