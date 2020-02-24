const generatorUtils = require("../utils/generator");
const validator = require("../utils/validator");
const chalk = require("chalk");
const questionService = require("../utils/questionService");

module.exports = async (args, options, logger) => {
  // VALIDATOR
  if (!validator.isSkaffolderFolder()) return;

  const resultOverwrite = await questionService.askConfirm("Do you want to overwrite ./.skaffolder/template folder?");
  if (resultOverwrite.value == true) {
    generatorUtils.importGenerator();
    logger.info(chalk.green("✔  Generator files imported in ./.skaffolder/template"));
    logger.info(chalk.blue("Now you can customize template files an generate code with " + chalk.green("'sk generate'")));
  } else {
    process.exit(0);
  }
};
