var projectService = require('../service/projectService');
var generatorBean = require('../generator/generatorBean');
var fs = require('fs');
var mkdirp = require('mkdirp');

exports.importGenerator = function (idProj, idGen, cb) {

    projectService.getGeneratorFile(idGen, (err, files) => {
        files.filter(file => {
            let path = generatorBean.pathTemplate + file.name;
            mkdirp.sync(path.substr(0, path.lastIndexOf('/')));
            fs.writeFileSync(path + ".hbs", getFileContent(file));
        });

        cb();
    })
}

let getFileContent = (file) => {
    var start = "**** PROPERTIES SKAFFOLDER ****\r\n";
    var end = '\r\n**** END PROPERTIES SKAFFOLDER ****\r\n';
    var template = file.template;
    file.template = undefined;
    file._id = undefined;
    file.__v = undefined;
    file._generator = undefined;
    file.name = undefined;
    file.ignore = undefined;
    file._partials.filter(part => part._id = undefined);

    var content = start + JSON.stringify(file, null, 4) + end + template;

    return content;
}