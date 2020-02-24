const cache = require("persistent-cache");
const globals = cache();
const chalk = require("chalk");

module.exports = (args, options, logger) => {
  let endpoint = "https://app.skaffolder.com";

  if (args.endpoint && args.endpoint !== "default") {
    endpoint = args.endpoint;
  }

  globals.putSync("endpoint", endpoint);
  logger.info(chalk.green("Set endpoint: ") + chalk.yellow(endpoint));
};
