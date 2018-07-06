var projectService = require('../service/projectService');
var generate = require('../lib/generate');
var prompt = require('prompt');
var colors = require("colors/safe");
var validator = require('../utils/validator');
var chalk = require('chalk');
var properties = require('../properties');
var configUtils = require('../utils/config');

module.exports = (args, options, logger) => {

    // ---- CREATE PAGE ---- 

    var createPage = function (name) {
        projectService.createPage(name, function (err, page) {
            if (err) return;

            var config = configUtils.getConf();
            logger.info(chalk.blue("You can edit your Page at ") + chalk.yellow(properties.endpoint + "/#!/projects/" + config.project + "/pages/" + page._id));
            generate(null, null, logger);
        });
    };

    // ---- INIT ---- 

    // VALIDATOR
    if (!validator.isSkaffolderFolder()) return;

    if (args.name) {
        // CREATE PAGE
        createPage(args.name);
    } else {

        // INIT PROMPT
        prompt.message = colors.green("Skaffolder");
        prompt.start();

        var schema = {
            properties: {
                name: {
                    description: 'Insert name of your page',
                    required: true
                },
            }
        };

        // ASK NAME
        prompt.get(schema, function (err, result) {

            // CREATE PAGE
            createPage(result.name);
        });
    }

}