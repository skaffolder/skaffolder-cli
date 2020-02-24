const cache = require("persistent-cache");
const globals = cache();
const chalk = require("chalk");

module.exports = (args, options, logger) => {
  const endpoint = globals.getSync("endpoint");
  logger.info(chalk.green("Endpoint: ") + chalk.yellow(endpoint));
};
