const projectService = require("../service/projectService");
const generate = require("../lib/generate");
const validator = require("../utils/validator");
const chalk = require("chalk");
const properties = require("../properties");
const configUtils = require("../utils/config");
const utils = require("../utils/utils");
const prompts = require("prompts");

module.exports = async (args, options, logger) => {
  // VALIDATOR
  if (!validator.isSkaffolderFolder()) return;
  if (global.ONLINE && !validator.isSkaffolderProject()) return;

  // ASK NAME
  let namePage = args.name;
  if (!namePage) {
    const response = await prompts({
      type: "text",
      name: "name",
      validate: res => !!res,
      message: "Insert the name of your page"
    });
    namePage = response.name;
  }

  // ---- CREATE PAGE ----
  // SLUG NAME
  namePage = utils.slugPageName(namePage);
  logger.info(chalk.green("Page name: ") + chalk.yellow(namePage));
  let url = utils.slugUrl("/" + namePage);
  projectService.createPage(namePage, url, function(err, page) {
    if (err) return;
    generate(null, null, logger);
  });
};
