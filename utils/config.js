var fs = require('fs');

exports.getConf = function () {
    let config = fs.readFileSync('.skaffolder/config.json');
    config = JSON.parse(config);
    return config;
}