var projectService = require('../service/projectService');
var generatorBean = require('../generator/generatorBean');
var config = require('../utils/config').getConf();
var validator = require('../utils/validator');

module.exports = (args, options, logger) => {

    // VALIDATOR
    if (!validator.isSkaffolderFolder()) return;

    // GET PROJECT
    projectService.getProject(config.project, function (err, files) {
        if (err) return;

        generatorBean.generate(files, logger, function () {
            logger.info("✔  Generation complete!")
        });
    });
}