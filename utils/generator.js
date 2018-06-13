var projectService = require('../service/projectService');

exports.importGenerator = function (idProj, idGen, cb) {

    projectService.getGeneratorFile(idGen, (err, files) => {
        files.filter(file => {
            //logger.info(file.name);
        });

        cb();
    })
}