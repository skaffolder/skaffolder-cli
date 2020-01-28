var cache = require("persistent-cache");
var globals = cache();

module.exports = (args, options, logger) => {
  globals.putSync("token", null);
  globals.putSync("user", null);

  if (logger) logger.info("✔ Logout succesfully");
};
