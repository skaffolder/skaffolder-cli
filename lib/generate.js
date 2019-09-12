var projectService = require("../service/projectService");
var generatorBean = require("../generator/GeneratorBean");
var validator = require("../utils/validator");
var chalk = require("chalk");
var properties = require("../properties");
var configUtils = require("../utils/config");

module.exports = (args, options, logger, cb) => {
  // VALIDATOR
  if (!validator.isSkaffolderFolder()) return;

  // GET PROJECT
  projectService.getProjectData(function(err, files) {
    if (err) return;

    generatorBean.generate("", files, logger, function() {
      logger.info(chalk.green("✔  Generation complete!"));
      var config = configUtils.getConf();
      logger.info(
        chalk.blue("You can edit your project structure at ") +
          chalk.yellow(
            properties.endpoint +
              "/#!/projects/" +
              config.project +
              "/design/models"
          )
      );

      if (cb) {
        cb();
      } else {
        process.exit(0);
      }
    });
  });
};
