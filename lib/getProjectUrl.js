var properties = require('../properties');
var config = require('../utils/config').getConf();

module.exports = (args, options, logger) => {
    logger.info(properties.endpoint + "/#!/projects/" + config.project + "/design/models");
}