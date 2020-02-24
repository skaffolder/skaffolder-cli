var extra = {};
try {
  extra = require(process.cwd() + "/extra");
} catch (e) {}

const cache = require("persistent-cache");
const globals = cache();

module.exports = {
  endpoint: extra.endpoint || globals.getSync("endpoint") || "https://app.skaffolder.com"
};
