const cache = require("persistent-cache");
const globals = cache();

module.exports = endpoint => {
  globals.putSync("endpoint", endpoint);
};
