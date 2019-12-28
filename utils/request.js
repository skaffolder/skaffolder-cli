var request = require("request");
var cache = require("persistent-cache");
var globals = cache();
var chalk = require("chalk");

module.exports = function(options, cb) {
  var token = globals.getSync("token");

  if (!options.headers) options.headers = {};
  if (token && !options.public) options.headers.Token = token;

  request(options, function(error, response, body) {
    if (error) {
      error = {
        message: error.code
      };
      console.error(chalk.red(error.message));
      process.exit(0);
    } else if (
      (body && typeof body == "String" && body.toLowerCase() == "not authorized") ||
      (body && body.message && body.message.toLowerCase() == "not authorized") || response.statusCode == 502
    ) {
      error = {
        message: "Not Authorized, try to change user the command: 'sk login' or check the command you ran"
      };
      console.error(chalk.red(error.message));
      process.exit(0);
    } else if (response.statusCode == 401) {
      error = {
        message: "You should login with the command: 'sk login'"
      };
      console.error(chalk.red(error.message));
      process.exit(0);
    } else if (response.statusCode == 405) {
      error = {
        message: "User not allowed\r\nYou should login with command: 'sk login'"
      };
      console.error(chalk.red(error.message));
      process.exit(0);
    } else if (response.statusCode == 403) {
      error = {
        message: "Nor permitted: " + body.message
      };
      console.error(chalk.red(error.message));
      console.error(chalk.blue("Please visit " + chalk.yellow("https://app.skaffolder.com/#!/upgrade")));
      process.exit(0);
    } else if (response.statusCode == 404) {
      error = {
        message: "URL not found"
      };
      console.error(chalk.red(body));
      process.exit(0);
    } else if (response.statusCode != 200) {
      error = {
        message: "ERROR " + response.statusCode
      };
      console.error(chalk.red(error.message));
      process.exit(0);
    }

    try {
      body = JSON.parse(body);
    } catch (e) {
      //console.log(chalk.yellow(e));
    }
    cb(error, body);
  });
};
