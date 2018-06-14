var properties = require('../properties');
var config = require('../utils/config').getConf();
var validator = require('../utils/validator');

module.exports = (args, options, logger) => {

    // VALIDATOR
    if (!validator.isSkaffolderFolder()) return;

    logger.info(properties.endpoint + "/#!/projects/" + config.project + "/design/models");
}