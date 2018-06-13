//var pathWorkspace = "./";
var pathWorkspace = "./build/";
var pathTemplate = ".skaffolder/template"
var fs = require('fs');
var path = require('path');
const klawSync = require('klaw-sync')
let async = require("async");

exports.generate = function (files, logger, cb) {

    var project = files.project;
    var modules = files.modules;
    var resources = files.resources;
    var dbs = files.dbs;
    var genFiles = getGenFiles();
    var log = [];

    try {
        logger.info("START GENERATE ");
        log.push("START GENERATE ");

        var utils = require('./GeneratorUtils.js');
        utils.init(pathWorkspace, project, modules, resources, dbs);

        async.each(genFiles, function (file, cbFile) {
            log.push("Elaborate file " + file.name);
            logger.info("Elaborate file ", file.name);

            generateFile(file, log, utils, project, modules, resources, dbs)

            cbFile(null);
        }, function (err) {
            cb(err, log);
        })


    } catch (e) {
        console.error(e);
    }
}

var generateFile = function (file, log, utils, project, modules, resources, dbs, opt) {
    if (file.forEachObj == 'oneTime') {
        return utils.generateFile(log, file, {}, opt);

    } else if (file.forEachObj == 'db') {

        if (opt && opt.paramsForEach) {
            for (var index in dbs) {
                if (dbs[index]._id.toString() == opt.paramsForEach) {
                    var db = resources[index];
                    db._entity = dbs[index]._entity;
                    return utils.generateFile(log, file, {
                        db: db
                    }, opt);
                }
            }
        } else {
            for (var index in dbs) {
                var db = resources[index];
                db._entity = dbs[index]._entity;
                utils.generateFile(log, file, {
                    db: db
                }, opt);
            }
        }

    } else if (file.forEachObj == 'table') {

        for (var index in dbs) {
            var db = dbs[index];
            for (var indexEnt in dbs[index]._entity) {

                var entity = dbs[index]._entity[indexEnt];

                if (opt && opt.paramsForEach) {
                    if (entity._id.toString() == opt.paramsForEach)
                        return utils.generateFile(log, file, {
                            entity: entity,
                            db: db
                        }, opt);;
                } else {
                    utils.generateFile(log, file, {
                        entity: entity,
                        db: db
                    }, opt);
                }
            }
        }

    } else if (file.forEachObj == 'module') {
        for (var index in modules) {

            var mod = modules[index];
            var moduleLink = {
                url: ""
            };
            var templateName = "";
            var templateResourceName = "";
            var linkUrl = "";
            var crudResource = "";

            if (mod.template) {
                var typeLink = "";

                //TROVA RISORSA CRUD
                for (dbId in resources) {
                    var resourcesForDb = resources[dbId]._resources;
                    for (resId in resourcesForDb) {
                        var resource = resourcesForDb[resId];
                        if (mod._template_resource.toString() == resource._id) {
                            crudResource = resource;
                        }
                    }
                }

                //TROVA LINK MODULO
                for (modId in modules) {
                    var module = modules[modId];
                    if (module.template == "List_Crud" &&
                        mod._template_resource &&
                        module._template_resource &&
                        module._template_resource.toString() == mod._template_resource.toString()) {

                        moduleLink = modules[modId];
                    }

                }

            }

            if (opt && opt.paramsForEach) {
                if (mod._id.toString() == opt.paramsForEach) {
                    return utils.generateFile(log, file, {
                        module: mod,
                        crudResource: crudResource,
                        linkUrl: moduleLink.url.replace('{id}', '') + "/"
                    }, opt);
                }
            } else {
                utils.generateFile(log, file, {
                    module: mod,
                    crudResource: crudResource,
                    linkUrl: moduleLink.url.replace('{id}', '') + "/"
                }, opt);
            }
        }
    } else if (file.forEachObj == 'resource') {
        for (var index in resources) {
            var db = resources[index];
            for (var indexRes in resources[index]._resources) {
                var resource = resources[index]._resources[indexRes];
                if (opt && opt.paramsForEach) {
                    if (resource._id.toString() == opt.paramsForEach)
                        return utils.generateFile(log, file, {
                            resource: resource,
                            db: db
                        }, opt);
                } else {
                    utils.generateFile(log, file, {
                        resource,
                        db: db
                    }, opt);
                }
            }
        }
    }
}

var getGenFiles = function () {

    return klawSync(pathTemplate, {
        nodir: true
    }).map(file => {
        let content = fs.readFileSync(file.path, "utf8");
        let genFile = getProperties(content);


        genFile.name = path.relative(pathTemplate, file.path);
        genFile.template = content;
        return genFile;
    })
}

var getProperties = (content) => {
    var start = "**** PROPERTIES SKAFFOLDER ****\r\n";
    var end = '\r\n**** END PROPERTIES SKAFFOLDER ****\r\n';
    let startPropr = content.indexOf(start);
    let endPropr = content.indexOf(end);

    let properties = content.substr(startPropr + start.length, endPropr - start.length);
    properties = JSON.parse(properties);
    properties.template = content.substr(endPropr - end.length);

    return properties;
}