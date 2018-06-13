var projectService = require('../service/projectService');
var generatorBean = require('../generator/generatorBean');
var config = require('../utils/config');

module.exports = (args, options, logger) => {

    // GET PROJECT
    projectService.getProject(config.project, function (err, files) {
        generatorBean.generate(files, logger, function () {
            logger.info("✔  Generation complete!")
        });
    });
}