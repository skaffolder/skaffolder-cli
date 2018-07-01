var projectService = require('../service/projectService');
var questionService = require('../utils/questionService');
var generatorUtils = require('../utils/generator');
var properties = require('../properties');
var prompt = require('prompt');
var colors = require("colors/safe");
var chalk = require('chalk');
var fs = require('fs');
var validator = require('../utils/validator');

module.exports = (args, options, logger) => {

    // VALIDATOR
    if (!validator.isLogged()) return;

    prompt.message = colors.green("Skaffolder");
    prompt.start();

    var schema = {
        properties: {
            name: {
                description: 'Insert name of your project',
                required: true
            },
        }
    };

    // ASK NAME
    prompt.get(schema, function (err, result) {

        // GET TEMPLATES
        projectService.getTemplate((err, template) => {

            let listFrontend = [];
            let listBackend = [];

            template.filter(temp => {
                if (temp.type == "frontend") {
                    listFrontend.push({
                        description: temp.name,
                        value: temp._id
                    })
                } else if (temp.type == "backend") {
                    listBackend.push({
                        description: temp.name,
                        value: temp._id
                    })
                }
            });

            listFrontend.push({
                description: chalk.gray("NONE"),
                value: null
            });
            listBackend.push({
                description: chalk.gray("NONE"),
                value: null
            });

            // SELECT FRONTEND
            questionService.ask({
                description: "Select your frontend language",
                list: listFrontend
            }, function (resultFrontend) {

                // SELECT BACKEND
                questionService.ask({
                    description: "Select your backend language",
                    list: listBackend
                }, function (resultBackend) {

                    // CREATE PROJECT
                    projectService.create(result.name, function (err, project) {
                        if (err) {
                            process.exit(0);
                        }

                        try {
                            fs.mkdirSync('.skaffolder');
                        } catch (e) {}
                        fs.writeFileSync('./.skaffolder/config.json', JSON.stringify({
                            project: project._id
                        }, null, 4));

                        logger.info(chalk.green('✔   Project created!'));
                        logger.info(chalk.blue("You can edit your project structure at ") + chalk.yellow(properties.endpoint + "/#!/projects/" + project._id + "/design/models"));

                        // CREATE TEMPLATE
                        projectService.createFromTemplate(project._id, resultFrontend.value, resultBackend.value, function (err, generator) {

                            fs.writeFileSync('.skaffolder/config.json', JSON.stringify({
                                project: project._id,
                                generator: generator._id
                            }, null, 4));
                            generatorUtils.importGenerator(project._id, generator._id, () => {
                                logger.info(chalk.green("✔  Generator file imported in ./.skaffolder/template"));
                                logger.info("Use " + chalk.green("'sk generate'") + " to generate your code");
                                process.exit(0);
                            });
                        });
                    });

                });
            });
        });
    });


}