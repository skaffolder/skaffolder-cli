const properties = require("../properties");
const opn = require("opn");
const configUtils = require("../utils/config");
const chalk = require("chalk");

module.exports = (args, options, logger) => {
  const config = configUtils.getConf();
  const url = properties.endpoint + "/#!/projects/" + config.project + "/models";

  logger.info(chalk.green("Opening ") + chalk.yellow(url) + chalk.green(" in your default browser..."));
  opn(url, {
    wait: false
  });
};
