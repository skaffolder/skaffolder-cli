var extra = {};
try {
    extra = require(process.cwd() + '/extra');
} catch (e) {}

module.exports = {
    endpoint: extra.endpoint || "https://app.skaffolder.com"
}