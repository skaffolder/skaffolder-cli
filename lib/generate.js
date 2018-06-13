var projectService = require('../service/projectService');
var generatorBean = require('../generator/generatorBean');

module.exports = (args, options, logger) => {

    // GET PROJECT
    projectService.getProject(id, function (err, files) {
        generatorBean.generate = function (files, cb)
    })
}