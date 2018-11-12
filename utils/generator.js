var projectService = require('../service/projectService');
var generatorBean = require('../generator/generatorBean');
var fs = require('fs-extra');
var mkdirp = require('mkdirp');
var chalk = require('chalk');
var path = require('path');
var klawSync = require('klaw-sync');
var prependFile = require('prepend-file');

// Convert folder file hbs to generator files db
var getGenFiles = function (pathTemplate) {
    var klawSync = require('klaw-sync')

    return klawSync(pathTemplate, {
        nodir: true
    }).map(file => {
        let nameFileTemplate = path.relative(pathTemplate, file.path);

        // Remove extension
        if (nameFileTemplate.substr(-4) == ".hbs") {
            let content = fs.readFileSync(file.path);
            nameFileTemplate = nameFileTemplate.substr(0, nameFileTemplate.length - 4);
            content = content.toString();

            // CHECK LIST EDIT FILE
            if (nameFileTemplate.substr(-8) == "_SK_EDIT" || nameFileTemplate.substr(-8) == "_SK_LIST") {
                nameFileTemplate = nameFileTemplate.substr(0, nameFileTemplate.length - 8);
                return undefined;
            }

            // get properties
            let genFile = getProperties(content, nameFileTemplate, pathTemplate);

            nameFileTemplate = nameFileTemplate.replace(/\\/g, "/");
            genFile.name = nameFileTemplate;

            return genFile;
        } else if (nameFileTemplate.endsWith(".DS_Store")) {
            return undefined;
        } else {
            // Binary file
            let content = fs.readFileSync(file.path, "binary");
            nameFileTemplate = nameFileTemplate.replace(/\\/g, "/");
            return {
                templateBinary: content,
                name: nameFileTemplate
            }
        }
    }).filter(file => file);
}


var getProperties = (content, nameFileTemplate, pathTemplate) => {

    // get properties
    let start = "**** PROPERTIES SKAFFOLDER ****\r\n";
    let startPropr = content.indexOf(start);
    if (startPropr == -1) {
        start = "**** PROPERTIES SKAFFOLDER ****\n";
        startPropr = content.indexOf(start);
    }

    let end = '\r\n**** END PROPERTIES SKAFFOLDER ****\r\n';
    let endPropr = content.indexOf(end);
    if (endPropr == -1) {
        end = '\n**** END PROPERTIES SKAFFOLDER ****\n';
        endPropr = content.indexOf(end);
    }

    if (startPropr == -1 || endPropr == -1) {
        console.warn("Properties Skaffoler not found in file " + nameFileTemplate);
        return {
            template: content
        }
    }

    let properties = content.substr(startPropr + start.length, endPropr - start.length);
    properties = JSON.parse(properties);

    // search list edit template
    let nameTemplateList = nameFileTemplate + "_SK_LIST.hbs";
    let fileNameList = pathTemplate + "/" + nameTemplateList;
    if (fs.existsSync(fileNameList)) {
        properties.templateList = fs.readFileSync(fileNameList, "utf-8");
    }

    let nameTemplateEdit = nameFileTemplate + "_SK_EDIT.hbs";
    let fileNameEdit = pathTemplate + "/" + nameTemplateEdit;
    if (fs.existsSync(fileNameEdit)) {
        properties.templateEdit = fs.readFileSync(fileNameEdit, "utf-8");
    }

    // set template
    properties.template = content.substr(endPropr + end.length);

    return properties;
}


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
            var isBinaryFile = require("isbinaryfile");

            if (isBinaryFile.sync(file.path)) {
                // is binary file
                let destPath = path.normalize(templateFolder + '/' + path.relative(process.cwd(), file.path));
                mkdirp.sync(path.normalize(destPath.substr(0, destPath.lastIndexOf(path.sep))));
                fs.copyFileSync(file.path, destPath);
            } else {
                // is text file
                let destPath = path.normalize(templateFolder + '/' + path.relative(process.cwd(), file.path) + ".hbs");
                mkdirp.sync(path.normalize(destPath.substr(0, destPath.lastIndexOf(path.sep))));
                fs.copyFileSync(file.path, destPath);
                let header = `**** PROPERTIES SKAFFOLDER ****
{
    "forEachObj": "oneTime",
    "overwrite": false,
    "_partials": []
}
**** END PROPERTIES SKAFFOLDER ****
`;
                prependFile.sync(destPath, header);
            }
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

exports.getGenFiles = getGenFiles;