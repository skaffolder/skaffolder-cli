var projectService = require('../service/projectService');
var questionService = require('../utils/questionService');
var generatorUtils = require('../utils/generator');
var properties = require('../properties');
var prompt = require('prompt');
var colors = require("colors/safe");
var chalk = require('chalk');
var reloadGenerator = require('./reloadGenerator');
var fs = require('fs');
var validator = require('../utils/validator');

module.exports = (args, options, logger) => {

    // VALIDATOR
    if (!validator.isLogged()) return;

    // GET PROJECTS
    projectService.getProjectList((err, projects) => {
        if (err) return;

        if (projects.length == 0) {
            logger.info(chalk.yellow("You have no projects"));
            process.exit(0);
        }

        projects = projects.map(proj => {
            return {
                description: proj.name,
                value: proj._id
            }
        });

        // SELECT PROJECT
        questionService.ask({
            description: "Select your project",
            list: projects
        }, function (selectedProject) {

            // GET GENERATORS
            projectService.getGeneratorList(selectedProject.value, (err, generators) => {

                if (generators.length == 0) {
                    logger.info(chalk.yellow("You have no generator for this projects"));
                    process.exit(0);
                }

                generators = generators.map(gen => {
                    return {
                        description: gen.name,
                        value: gen._id
                    }
                });

                // SELECT GENERATOR
                questionService.ask({
                    description: "Select your generator",
                    list: generators
                }, function (selectedGenerator) {

                    // store config file
                    try {
                        // TODO DELETE BEFORE
                        fs.mkdirSync('.skaffolder');
                    } catch (e) {}
                    fs.writeFileSync('.skaffolder/config.json', JSON.stringify({
                        project: selectedProject.value,
                        generator: selectedGenerator.value
                    }, null, 4));
                    reloadGenerator(null, null, logger);
                })

            });

        })
    });
}