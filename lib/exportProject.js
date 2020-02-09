var chalk = require("chalk");
var exportProject = require("../utils/export").exportProject;
var questionService = require("../utils/questionService");
var validator = require("../utils/validator");
var offlineService = require("../utils/offlineService");

module.exports = async (args, options, logger) => {
  if (!validator.isLogged()) return;
  if (!validator.isSkaffolderFolder()) return;

  let params = {
    skObject: offlineService.getYaml(null, logger),
    outputHtml: false
  };

  const resultOverwrite = await questionService.askConfirm(
    "Do you want to save your project to Skaffolder platform?\nThis will overwrite any model, API and page already present on the platform"
  );
  if (resultOverwrite.value) {
    exportProject(params, function(err, logs) {
      if (err) {
        logger.error(chalk.red(err));
      } else {
        if (logs.length > 0) {
          logs.forEach(element => {
            if (element.startsWith("[UPDATE]:")) {
              logger.info(chalk.magenta("[UPDATE]:") + element.substring("[UPDATE]:".length));
            } else if (element.startsWith("[CREATE]:")) {
              logger.info(chalk.green("[CREATE]:") + element.substring("[CREATE]:".length));
            } else if (element.startsWith("[DELETE]:")) {
              logger.info(chalk.red("[DELETE]:") + element.substring("[DELETE]:".length));
            } else if (element.startsWith("[ERROR]:")) {
              logger.info(chalk.red("[ERROR]:") + element.substring("[ERROR]:".length));
            } else {
              logger.info(chalk.green(element));
            }
          });
        } else {
          logger.info(chalk.green("Everything up-to-date"));
        }
      }
    });
  } else {
    process.exit(0);
  }
};
