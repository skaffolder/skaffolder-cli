let cache = require("persistent-cache");
let properties = require("../properties");
let configUtils = require("../utils/config");
let validator = require("../utils/validator");
let chalk = require("chalk");
let globals = cache();

module.exports = (args, options, logger) => {
  // VALIDATOR
  if (!validator.isSkaffolderFolder()) return;

  let config = configUtils.getConf();
  logger.info(chalk.green("To manage data models, APIs and pages of your project, visit this URL:"));
  logger.info(chalk.yellow(properties.endpoint + "/#!/projects/" + config.project + "/models"));
};
