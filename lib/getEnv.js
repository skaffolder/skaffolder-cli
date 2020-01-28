var cache = require("persistent-cache");
var globals = cache();

module.exports = () => {
  return globals.getSync("endpoint");
};
