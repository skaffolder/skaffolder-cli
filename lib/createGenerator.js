const projectService = require("../service/projectService");
const questionService = require("../utils/questionService");
const generatorUtils = require("../utils/generator");
const chalk = require("chalk");
const fs = require("fs-extra");

module.exports = async (args, options, logger) => {
  // GET TEMPLATES

  projectService.getTemplate(async (err, template) => {
    let listFrontend = [];
    let listBackend = [];

    if (err) {
      logger.error(chalk.red("Template server not reachable"));
      return;
    }

    template.filter(temp => {
      if (temp.type == "frontend") {
        listFrontend.push({
          title: temp.name,
          value: temp._id
        });
      } else if (temp.type == "backend") {
        listBackend.push({
          title: temp.name,
          value: temp._id
        });
      }
    });

    listFrontend.push({
      title: chalk.gray("NONE"),
      value: null
    });
    listBackend.push({
      title: chalk.gray("NONE"),
      value: null
    });

    // SELECT FRONTEND
    const resultFrontend = await questionService.ask("Select your frontend language", listFrontend);

    // SELECT BACKEND
    const resultBackend = await questionService.ask("Select your backend language", listBackend);

    // ASK CONFIRM TO OVERRIDE
    let override = true;

    if (fs.existsSync("./.skaffolder/template")) {
      const resultConfirm = await questionService.askConfirm(
        chalk.red("This will override your .skaffolder/template folder.\n\t\tConfirm?")
      );
      override = resultConfirm.value;
    }

    if (override == true) {
      // DELETE CONTENT TEMPLATE FOLDER
      fs.removeSync(".skaffolder/template");

      // CREATE TEMPLATE
      generatorUtils.loadTemplateFiles(resultFrontend.value, resultBackend.value, () => {
        logger.info(chalk.green("✔  Generator files imported in ./.skaffolder/template"));
        logger.info(chalk.yellow("\nNow you can generate your code running ") + chalk.green("'sk generate'\n"));
      });
    }
  });
};
