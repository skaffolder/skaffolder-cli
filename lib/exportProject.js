const chalk = require("chalk");
const exportProject = require("../utils/export").exportProject;
const questionService = require("../utils/questionService");
const validator = require("../utils/validator");
const offlineService = require("../utils/offlineService");
const configUtils = require("../utils/config");
const generator = require("../utils/generator");
const properties = require("../properties");

module.exports = async (args, options, logger) => {
  if (!validator.isLogged()) return;
  if (!validator.isSkaffolderFolder()) return;
  global.logger = logger;

  // Read yaml
  let openApi = offlineService.getYaml(null, logger);

  // Normalize YAML
  openApi = await generator.normalizeYaml(openApi);

  let params = {
    skObject: openApi,
    outputHtml: false
  };

  // Check if project exists
  const config = configUtils.getConf();
  let resultOverwrite = { value: true };
  if (config.project) {
    resultOverwrite = await questionService.askConfirm(
      "Do you want to save your project to Skaffolder platform?\nThis will overwrite any model, API and page already present on the platform"
    );
  }

  if (resultOverwrite.value) {
    // Export to server
    exportProject(params, function(err, logs) {
      if (err) {
        return logger.error(chalk.red("Error in exporting the project: "), err);
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

      const configNew = configUtils.getConf();

      logger.info(chalk.green("Everything up-to-date"));
      logger.info(
        chalk.blue("You can edit your project structure at ") +
          chalk.yellow(properties.endpoint + "/#!/projects/" + configNew.project + "/models\n") +
          chalk.blue(" or running ") +
          chalk.yellow("'sk web open'")
      );
    });
  } else {
    process.exit(0);
  }
};
