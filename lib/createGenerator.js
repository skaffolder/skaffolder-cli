var projectService = require("../service/projectService");
var questionService = require("../utils/questionService");
var generatorUtils = require("../utils/generator");
var chalk = require("chalk");
var fs = require("fs-extra");
const prompts = require("prompts");

module.exports = (args, options, logger) => {
  // GET TEMPLATES
  projectService.getTemplate((err, template) => {
    let listFrontend = [];
    let listBackend = [];
    let listYN = [
      {
        description: "\t\tNo",
        value: false
      },
      {
        description: "\t\tYes",
        value: true
      }
    ];

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
            questionService.ask(
              {
                description: chalk.red("This will override your .skaffolder/tempalte folder.\n\t\tConfirm?"),
                list: listYN
              },
              function(resultConfirm) {
                if (resultConfirm.value == true) {
                  // DELETE CONTENT TEMPLATE FOLDER
                  fs.removeSync(".skaffolder/template");

                  // CREATE TEMPLATE
                  generatorUtils.loadTemplateFiles(resultFrontend.value, resultBackend.value, () => {
                    logger.info(chalk.green("✔  Generator files imported in ./.skaffolder/template"));
                  });
                }
              }
            );
          }
        );
      }
    );
  });
};
