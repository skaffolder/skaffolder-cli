const projectService = require("../service/projectService");
const generate = require("../lib/generate");
const prompt = require("prompt");
const colors = require("colors/safe");
const validator = require("../utils/validator");
const chalk = require("chalk");
const properties = require("../properties");
const configUtils = require("../utils/config");
const utils = require("../utils/utils");

module.exports = (args, options, logger) => {
  // ---- CREATE PAGE ----
  const createPage = function(name) {
    // SLUG NAME
    name = utils.slugPageName(name);
    logger.info(chalk.green("Page name: ") + chalk.yellow(name));
    let url = utils.slugUrl("/" + name);
    projectService.createPage(name, url, function(err, page) {
      if (err) return;

      var config = configUtils.getConf();
      logger.info(
        chalk.blue("You can edit your Page at ") +
          chalk.yellow(properties.endpoint + "/#!/projects/" + config.project + "/pages/" + page._id)
      );
      generate(null, null, logger);
    });
  };

  // ---- INIT ----

  // VALIDATOR
  if (!validator.isSkaffolderFolder()) return;

  if (args.name) {
    // CREATE PAGE
    createPage(args.name);
  } else {
    // INIT PROMPT
    prompt.message = colors.green("Skaffolder");
    prompt.start();

    var schema = {
      properties: {
        name: {
          description: "Insert name of your page",
          required: true
        }
      }
    };

    // ASK NAME
    prompt.get(schema, function(err, result) {
      // CREATE PAGE
      createPage(result.name);
    });
  }
};
