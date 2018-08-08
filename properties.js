var config = {};
try {
    config = require(process.cwd() + '/.skaffolder/extra');
} catch (e) {}

module.exports = {
    endpoint: config.endpoint || "https://app.skaffolder.com"
}