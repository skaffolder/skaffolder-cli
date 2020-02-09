var projectService = require("../service/projectService");
var fs = require("fs");
var path = require("path");
var validator = require("../utils/validator");
var chalk = require("chalk");
var properties = require("../properties");
var configUtils = require("../utils/config");

module.exports = (args, options, logger) => {
  // VALIDATOR
  if (!validator.isSkaffolderFolder()) return;

  if (!fs.existsSync(args.file)) {
    console.log(chalk.red("File " + path.resolve(args.file) + " not found"));
    process.exit(0);
  }

  let contentFile = fs.readFileSync(args.file, "utf-8");
  projectService.importDb(contentFile, function(err, data) {
    if (err) {
      console.error(chalk.red(err));
    } else {
      var config = configUtils.getConf();
      logger.info(chalk.green("✔   Db import completed!"));
      logger.info(
        chalk.blue("You can edit your project structure at ") +
          chalk.yellow(properties.endpoint + "/#!/projects/" + config.project + "/design/models")
      );
    }
  });
};
