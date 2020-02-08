var projectService = require("../service/projectService");
var questionService = require("../utils/questionService");
var generatorUtils = require("../utils/generator");
var generate = require("../lib/generate");
var properties = require("../properties");
var prompts = require("prompts");
var prompt = require("prompt");
var colors = require("colors/safe");
var chalk = require("chalk");
var mkdirp = require("mkdirp");
var fs = require("fs");
var validator = require("../utils/validator");

module.exports = async (args, options, logger) => {
  // VALIDATOR
  if (global.ONLINE) {
    if (!validator.isLogged()) return;
  }

  prompt.message = colors.green("Skaffolder");
  prompt.start();

  // ASK NAME
  let nameProject = args.name;
  if (!nameProject) {
    const response = await prompts({
      type: "text",
      name: "name",
      validate: res => !!res,
      message: "Insert name of your project?"
    });
    nameProject = response.name;
  }

  // GET TEMPLATES
  projectService.getTemplate((err, template) => {
    if (!template) {
      logger.error(chalk.red("No tempaltes available!"));
      return process.exit(0);
    }

    let listFrontend = [];
    let listBackend = [];

    template.filter(temp => {
      if (temp.type == "frontend") {
        listFrontend.push({
          description: temp.name,
          value: temp._id
        });
      } else if (temp.type == "backend") {
        listBackend.push({
          description: temp.name,
          value: temp._id
        });
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
    questionService.ask(
      {
        description: "Select your frontend language",
        list: listFrontend
      },
      function(resultFrontend) {
        // SELECT BACKEND
        questionService.ask(
          {
            description: "Select your backend language",
            list: listBackend
          },
          function(resultBackend) {
            if (!global.OFFLINE) {
              // CREATE PROJECT
              projectService.create(nameProject, function(err, project) {
                if (err) {
                  return process.exit(0);
                }

                try {
                  mkdirp.sync("./.skaffolder/template");
                } catch (e) {}
                fs.writeFileSync(
                  "./.skaffolder/config.json",
                  JSON.stringify(
                    {
                      project: project._id
                    },
                    null,
                    4
                  )
                );

                logger.info(chalk.green("✔   Project created!"));
                logger.info(
                  chalk.blue("You can edit your project structure at ") +
                    chalk.yellow(properties.endpoint + "/#!/projects/" + project._id + "/design/models")
                );

                // CREATE TEMPLATE
                projectService.createFromTemplate(project._id, resultFrontend.value, resultBackend.value, function(
                  err,
                  generator
                ) {
                  fs.writeFileSync(
                    ".skaffolder/config.json",
                    JSON.stringify(
                      {
                        project: project._id,
                        generator: generator._id
                      },
                      null,
                      4
                    )
                  );
                  generatorUtils.loadGenerator(project._id, generator._id, () => {
                    logger.info(chalk.green("✔  Generator files imported in ./.skaffolder/template"));

                    generate(null, null, logger);
                  });
                });
              });
            } else {
              chalk.orange("test");
              logger.info(chalk.green("✔   Project created offline!\n"));
              logger.info(
                chalk.white("You can edit the project the project from the ") +
                  chalk.yellow("web interface") +
                  chalk.white(" running ") +
                  chalk.green("'sk export'")
              );
              logger.info(
                chalk.white("You can edit the project the project from the ") +
                  chalk.yellow("VSCode extension") +
                  chalk.green(" https://github.com/skaffolder/skaffolder-vscode-extension")
              );
              logger.info(
                chalk.white("You can edit the project the project from the ") +
                  chalk.green("openapi.yaml") +
                  chalk.yellow(" file")
              );
              logger.info(
                chalk.white("You can edit the project the project from the ") + chalk.yellow("command line") + chalk.white(":")
              );

              logger.info(chalk.white("\tAdd a model running ") + chalk.green("'sk add model'"));
              logger.info(chalk.white("\tAdd a page running ") + chalk.green("'sk add page'"));
              logger.info(chalk.white("\tAdd an API running ") + chalk.green("'sk add api'"));

              logger.info(chalk.yellow("\nGenerate your code running ") + chalk.green("'sk generate'"));
            }
          }
        );
      }
    );
  });
};
