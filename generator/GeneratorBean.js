var pathWorkspace = "./";
const pathTemplate = ".skaffolder/template/";
const fs = require("fs");
const path = require("path");
const klawSync = require("klaw-sync");
const async = require("async");
const chalk = require("chalk");

exports.pathTemplate = pathTemplate;

exports.generate = function(workspacePrefix, files, logger, cb) {
  var project = files.project;
  var modules = files.modules;
  var resources = files.resources;
  var dbs = files.dbs;
  var genFiles = getGenFiles(workspacePrefix + pathTemplate);
  var log = [];

  try {
    // logger.info(chalk.green("START GENERATE "));
    log.push("<h1>START GENERATE</h1>");

    var utils = require("./GeneratorUtils.js");
    utils.init(
      workspacePrefix + pathWorkspace,
      project,
      modules,
      resources,
      dbs
    );

    async.each(
      genFiles,
      function(file, cbFile) {
        // log.push("Elaborate file " + file.name);
        // logger.info(chalk.green("Elaborate file "), file.name);

        generateFile(file, log, utils, project, modules, resources, dbs);

        cbFile(null);
      },
      function(err) {
        log.push("<h2>GENERATION COMPLETE</h2>");

        cb(err, log);
      }
    );
  } catch (e) {
    console.error(e);
  }
};

var generateFile = function(
  file,
  log,
  utils,
  project,
  modules,
  resources,
  dbs,
  opt
) {
  if (!file.forEachObj || file.forEachObj == "oneTime") {
    return utils.generateFile(log, file, {}, opt);
  } else if (file.forEachObj == "db") {
    if (opt && opt.paramsForEach) {
      for (var index in dbs) {
        if (dbs[index]._id.toString() == opt.paramsForEach) {
          var db = resources[index];
          db._entity = dbs[index]._entity;
          return utils.generateFile(
            log,
            file,
            {
              db: db
            },
            opt
          );
        }
      }
    } else {
      for (var index in dbs) {
        var db = resources[index];
        db._entity = dbs[index]._entity;
        utils.generateFile(
          log,
          file,
          {
            db: db
          },
          opt
        );
      }
    }
  } else if (file.forEachObj == "table") {
    for (var index in dbs) {
      var db = dbs[index];
      for (var indexEnt in dbs[index]._entity) {
        var entity = dbs[index]._entity[indexEnt];

        if (opt && opt.paramsForEach) {
          if (entity._id.toString() == opt.paramsForEach)
            return utils.generateFile(
              log,
              file,
              {
                entity: entity,
                db: db
              },
              opt
            );
        } else {
          utils.generateFile(
            log,
            file,
            {
              entity: entity,
              db: db
            },
            opt
          );
        }
      }
    }
  } else if (file.forEachObj == "module") {
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

        // TROVA RISORSA CRUD
        if (mod._template_resource) {
          for (dbId in resources) {
            var resourcesForDb = resources[dbId]._resources;
            for (resId in resourcesForDb) {
              var resource = resourcesForDb[resId];
              if (mod._template_resource.toString() == resource._id) {
                crudResource = resource;
              }
            }
          }

          if (crudResource == "") {
            log.push(
              "Resource CRUD not found: " + mod._template_resource.toString()
            );
          }
        }

        // TROVA LINK MODULO
        for (modId in modules) {
          var module = modules[modId];
          if (
            module.template == "List_Crud" &&
            mod._template_resource &&
            module._template_resource &&
            module._template_resource.toString() ==
              mod._template_resource.toString()
          ) {
            moduleLink = modules[modId];
          }
        }
      }

      if (opt && opt.paramsForEach) {
        if (mod._id.toString() == opt.paramsForEach) {
          return utils.generateFile(
            log,
            file,
            {
              module: mod,
              crudResource: crudResource,
              linkUrl: moduleLink.url.replace("{id}", "") + "/"
            },
            opt
          );
        }
      } else {
        utils.generateFile(
          log,
          file,
          {
            module: mod,
            crudResource: crudResource,
            linkUrl: moduleLink.url.replace("{id}", "") + "/"
          },
          opt
        );
      }
    }
  } else if (file.forEachObj == "resource") {
    for (var index in resources) {
      var db = resources[index];
      for (var indexRes in resources[index]._resources) {
        var resource = resources[index]._resources[indexRes];

        //console.log(resource._entity._attrs);
        if (opt && opt.paramsForEach) {
          if (resource._id.toString() == opt.paramsForEach)
            return utils.generateFile(
              log,
              file,
              {
                resource: resource,
                db: db
              },
              opt
            );
        } else {
          utils.generateFile(
            log,
            file,
            {
              resource,
              db: db
            },
            opt
          );
        }
      }
    }
  }
};

// Convert folder file hbs to generator files db
var getGenFiles = function(pathTemplate) {
  var klawSync = require("klaw-sync");

  //console.log("-----" + pathTemplate);
  return klawSync(pathTemplate, {
    nodir: true
  })
    .map(file => {
      let content = fs.readFileSync(file.path, "utf8");
      let nameFileTemplate = path.relative(pathTemplate, file.path);

      // Remove extension
      if (nameFileTemplate.substr(-4) == ".hbs") {
        nameFileTemplate = nameFileTemplate.substr(
          0,
          nameFileTemplate.length - 4
        );

        // CHECK LIST EDIT FILE
        if (
          nameFileTemplate.substr(-8) == "_SK_EDIT" ||
          nameFileTemplate.substr(-8) == "_SK_LIST"
        ) {
          nameFileTemplate = nameFileTemplate.substr(
            0,
            nameFileTemplate.length - 8
          );
          return null;
        }

        // get properties
        let genFile = getProperties(content, nameFileTemplate, pathTemplate);
        genFile.name = nameFileTemplate;

        return genFile;
      } else {
        // Binary file
        let content = fs.readFileSync(file.path, "binary");

        return {
          templateBinary: content,
          name: nameFileTemplate
        };
      }
    })
    .filter(file => file);
};

var getProperties = (content, nameFileTemplate, pathTemplate) => {
  // get properties
  var start = "**** PROPERTIES SKAFFOLDER ****";
  var end = "**** END PROPERTIES SKAFFOLDER ****";
  let startPropr = content.indexOf(start);
  let endPropr = content.indexOf(end);

  if (startPropr == -1 || endPropr == -1) {
    console.warn(
      chalk.yellow("WARN:") +
        " Properties Skaffoler not found in file " +
        nameFileTemplate
    );
    return {
      template: content,
      forEachObj: "oneTime"
    };
  }

  let properties = content.substr(
    startPropr + start.length,
    endPropr - start.length
  );

  // backticks
  res = properties.search(/`(.|\r\n|\r|\n)*`/g);
  backticks = properties.match(/`(.|\r\n|\r|\n)*`/g);
  for (i in backticks) {
    replacement = backticks[i]
      .replace(/"/g, '\\"')
      .replace(/`/g, '"')
      .replace(/\r\n/g, "\\r\\n")
      .replace(/\n/g, "\\n")
      .replace(/\t/g, "\\t");
    properties = properties.replace(backticks[i], replacement);
  }
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

  if (properties.template.charAt(0) == "\r")
    properties.template = properties.template.substr(1);

  if (properties.template.charAt(0) == "\n")
    properties.template = properties.template.substr(1);

  if (!properties.forEachObj) properties.forEachObj = "oneTime";

  return properties;
};

exports.getGenFiles = getGenFiles;
