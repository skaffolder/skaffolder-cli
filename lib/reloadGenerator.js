const generatorUtils = require("../utils/generator");
const configUtils = require("../utils/config");
const validator = require("../utils/validator");
const chalk = require("chalk");
const properties = require("../properties");

module.exports = (args, options, logger) => {
  // VALIDATOR
  if (!validator.isSkaffolderProject()) return;

  const config = configUtils.getConf();
  generatorUtils.loadGenerator(config.project, config.generator, () => {
    logger.info(chalk.green("✔  Generator files imported in ./.skaffolder/template"));
    logger.info(
      chalk.blue("You can edit your project structure at ") +
        chalk.yellow(properties.endpoint + "/#!/projects/" + config.project + "/models") +
        chalk.blue(" or running ") +
        chalk.yellow("'sk web open'")
    );
    process.exit(0);
  });
};
