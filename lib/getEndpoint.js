var cache = require("persistent-cache");
var globals = cache();
var chalk = require("chalk");

module.exports = (args, options, logger) => {
  const endpoint = globals.getSync("endpoint");
  logger.info(chalk.green("Endpoint: ") + chalk.yellow(endpoint));
};
