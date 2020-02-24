const generatorUtils = require("../utils/generator");
const configUtils = require("../utils/config");
const validator = require("../utils/validator");
const chalk = require("chalk");
const properties = require("../properties");
const questionService = require("../utils/questionService");
const projectService = require("../service/projectService");

module.exports = async (args, options, logger) => {
  // VALIDATOR
  if (!validator.isSkaffolderFolder()) return;

  const resultOverwrite = await questionService.ask(
    "Do you want to save ./.skaffolder/template folder to Skaffolder platform?\nThis will override any customization on Skaffolder generator on the online platform"
  );
  if (resultOverwrite.value == true) {
    // get files
    let genFiles = generatorUtils.getGenFiles("./.skaffolder/template");

    // get helpers
    let extra = {};
    try {
      extra = require(process.cwd() + "/extra");

      for (let i in extra.helpers) {
        extra.helpers[i].fn = extra.helpers[i].fn.toString();
      }
    } catch (e) {}

    const config = configUtils.getConf();
    projectService.saveGenerator(config.generator, genFiles, extra.helpers, function() {
      logger.info(chalk.green("✔  Generator files saved on: "));
      logger.info(
        chalk.yellow(properties.endpoint + "/#!/projects/" + config.project + "/generators/" + config.generator + "/file")
      );
    });
  } else {
    process.exit(0);
  }
};
