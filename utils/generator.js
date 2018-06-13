var projectService = require('../service/projectService');
var fs = require('fs');
var mkdirp = require('mkdirp');

exports.importGenerator = function (idProj, idGen, cb) {

    projectService.getGeneratorFile(idGen, (err, files) => {
        files.filter(file => {
            let path = '.skaffolder/template/' + file.name;
            mkdirp.sync(path.substr(0, path.lastIndexOf('/')));
            fs.writeFileSync(path, file.template);
        });

        cb();
    })
}