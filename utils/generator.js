var projectService = require('../service/projectService');
var generatorBean = require('../generator/generatorBean');
var fs = require('fs');
var mkdirp = require('mkdirp');
var chalk = require('chalk');

exports.importGenerator = function (idProj, idGen, cb) {

    projectService.getGeneratorFile(idGen, (err, files) => {
        try {
            files = JSON.parse(files);
        } catch (e) {}

        files.filter(file => {
            let path = generatorBean.pathTemplate + file.name;
            mkdirp.sync(path.substr(0, path.lastIndexOf('/')));

            if (file.templateList) {
                fs.writeFileSync(path + "_SK_LIST.hbs", file.templateList);
                file.templateList = undefined;
            }

            if (file.templateEdit) {
                fs.writeFileSync(path + "_SK_EDIT.hbs", file.templateEdit);
                file.templateEdit = undefined;
            }

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