var config = require("../utils/config");
var chalk = require("chalk");
var cache = require("persistent-cache");
var globals = cache();

exports.isSkaffolderFolder = function() {
  if (!global.OFFLINE) {
    if (config.getConf().project !== undefined && config.getConf().project != "") return true;
  } else {
    if (config.getConf() !== undefined) return true;
  }

  console.error(chalk.red("You need to run this command from a Skaffolder project folder"));
  console.error(chalk.red("Run " + chalk.green("'sk new'") + " to create a new project"));
  return false;
};

exports.isLogged = function() {
  var token = globals.getSync("token");
  if (token) return true;

  console.error(chalk.red("You should be logged to run this command"));
  console.error(chalk.red("Run " + chalk.green("'sk login'") + "  to login"));
  return false;
};
