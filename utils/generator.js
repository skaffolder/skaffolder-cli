var projectService = require('../service/projectService');
var generatorBean = require('../generator/generatorBean');
var fs = require('fs-extra');
var mkdirp = require('mkdirp');
var chalk = require('chalk');
var path = require('path');
var klawSync = require('klaw-sync');
var prependFile = require('prepend-file');

exports.importGenerator = function () {

    let templateFolder = path.normalize('./.skaffolder/template');
    // clean generator
    fs.removeSync(templateFolder);

    klawSync(process.cwd(), {
        filter: function (item) {
            const basename = path.basename(item.path)
            let filter = basename[0] !== '.' &&
                basename !== 'dist' &&
                basename !== 'bin' &&
                basename !== 'node_modules'
            return filter;
        }

    }).map(file => {
        if (file.stats.isFile()) {
            let destPath = path.normalize(templateFolder + '/' + path.relative(process.cwd(), file.path) + ".hbs");

            mkdirp.sync(path.normalize(destPath.substr(0, destPath.lastIndexOf(path.sep))));
            fs.copyFileSync(file.path, destPath);
            let header = `**** PROPERTIES SKAFFOLDER ****
{
    "forEachObj": "oneTime",
    "overwrite": false,
    "_partials": []
}
**** END PROPERTIES SKAFFOLDER ****`;
            prependFile.sync(destPath, header);
        }
    });
}

exports.loadGenerator = function (idProj, idGen, cb) {

    projectService.getGeneratorFile(idGen, (err, files) => {
        try {
            files = JSON.parse(files);
        } catch (e) {}

        files.filter(file => {
            let path = generatorBean.pathTemplate + file.name;
            path = path.replace(/{{#([^}]+)}}{{\/([^}]+)}}/g, "{{$1}}");
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