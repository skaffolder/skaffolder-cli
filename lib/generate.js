const projectService = require("../service/projectService");
const generatorBean = require("../generator/GeneratorBean");
const validator = require("../utils/validator");
const chalk = require("chalk");
const properties = require("../properties");
const configUtils = require("../utils/config");

module.exports = (args, options, logger, cb) => {
  // VALIDATOR
  if (global.OFFLINE) if (!validator.isSkaffolderFolder()) return;

  if (!validator.hasSkaffolderTemplate()) return;

  // GET PROJECT
  projectService.getProjectData(function(err, files) {
    if (err) return;

    generatorBean.generate("", files, logger, function() {
      logger.info(chalk.green("✔  Generation complete!"));
      var config = configUtils.getConf();
      if (config.project)
        logger.info(
          chalk.blue("You can edit your project structure at ") +
            chalk.yellow(properties.endpoint + "/#!/projects/" + config.project + "/models") +
            chalk.blue(" or running ") +
            chalk.yellow("'sk web open'")
        );

      if (cb) {
        cb();
      } else {
        process.exit(0);
      }
    });
  });
};
