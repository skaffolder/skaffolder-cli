var cache = require("persistent-cache");
var globals = cache();

module.exports = endpoint => {
  globals.putSync("endpoint", endpoint);
};
