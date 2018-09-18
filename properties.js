var extra = {};
try {
    extra = require(process.cwd() + '/extra');
} catch (e) {}

var cache = require('persistent-cache');
var globals = cache();


module.exports = {
    endpoint: extra.endpoint || globals.getSync("endpoint") || "https://app.skaffolder.com"
}