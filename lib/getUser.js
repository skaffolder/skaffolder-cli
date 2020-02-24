let cache = require("persistent-cache");
let globals = cache();
let chalk = require("chalk");

module.exports = (args, options, logger) => {
  const user = globals.getSync("user");

  if (user) {
    logger.info(chalk.green("User: ") + chalk.yellow(user));
  } else {
    logger.info(chalk.green("User: ") + chalk.yellow("Not logged"));
    logger.info(chalk.blue("Please login using the command: ") + chalk.yellow("sk login"));
  }
};
