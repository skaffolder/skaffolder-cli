var projectService = require("../service/projectService");
var questionService = require("../utils/questionService");
var generatorUtils = require("../utils/generator");
var chalk = require("chalk");
var fs = require("fs-extra");

module.exports = async (args, options, logger) => {
  // GET TEMPLATES
  projectService.getTemplate(async (err, template) => {
    let listFrontend = [];
    let listBackend = [];

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
    const resultConfirm = await questionService.askConfirm(
      chalk.red("This will override your .skaffolder/template folder.\n\t\tConfirm?")
    );

    if (resultConfirm.value == true) {
      // DELETE CONTENT TEMPLATE FOLDER
      fs.removeSync(".skaffolder/template");

      // CREATE TEMPLATE
      generatorUtils.loadTemplateFiles(resultFrontend.value, resultBackend.value, () => {
        logger.info(chalk.green("✔  Generator files imported in ./.skaffolder/template"));
      });
    }
  });
};
