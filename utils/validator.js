const config = require("../utils/config");
const chalk = require("chalk");
const fs = require("fs");
const cache = require("persistent-cache");
const globals = cache();

/**
 * Check if the current folder contains a Skaffolder project
 * Check if openapi.yaml exists
 */
exports.isSkaffolderFolder = function() {
  if (fs.existsSync("openapi.yaml")) return true;

  console.error(chalk.red("You need to run this command from a Skaffolder local project folder"));
  console.error(chalk.red("Run " + chalk.green("'sk new'") + " to create a new project"));
  return false;
};

/**
 * Check if the current folder contains a remote Skaffolder project
 * Check if ./skaffolder/config.json exists and has a project Id
 */
exports.isSkaffolderProject = function() {
  if (config.getConf().project !== undefined && config.getConf().project != "") return true;

  console.error(chalk.red("You need to run this command from a remote Skaffolder project folder"));
  console.error(
    chalk.red("Run " + chalk.green("'sk new --online'") + " or " + chalk.green("'sk export'") + " to create a new project")
  );
  return false;
};

/**
 * Check if the current folder has a Skaffolder template
 * Check if ./skaffolder/template exists as directory
 */
exports.hasSkaffolderTemplate = function() {
  if (fs.existsSync("./.skaffolder/template") && fs.statSync("./.skaffolder/template").isDirectory()) return true;

  console.error(chalk.red("You need to run this command from a remote Skaffolder project folder with a generator"));
  console.error(chalk.red("Run " + chalk.green("'sk generator init'") + " to initialize a Skaffolder generator"));
  return false;
};

/**
 * Check if the the Skaffolder user is logged
 */
exports.isLogged = function() {
  var token = globals.getSync("token");
  if (token) return true;

  console.error(chalk.red("You should be logged to run this command"));
  console.error(chalk.red("Run " + chalk.green("'sk login'") + "  to login"));
  return false;
};
