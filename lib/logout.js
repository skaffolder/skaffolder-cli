const cache = require("persistent-cache");
const globals = cache();
const chalk = require("chalk");

module.exports = (args, options, logger) => {
  globals.putSync("token", null);
  globals.putSync("user", null);

  if (logger) logger.info(chalk.green("✔ Logout successfully"));
};
