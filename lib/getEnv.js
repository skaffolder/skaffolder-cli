let cache = require("persistent-cache");
let globals = cache();

module.exports = () => {
  return globals.getSync("endpoint");
};
