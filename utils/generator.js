const projectService = require("../service/projectService");
const generatorBean = require("../generator/GeneratorBean");
const fs = require("fs-extra");
const mkdirp = require("mkdirp");
const chalk = require("chalk");
const path = require("path");
const klawSync = require("klaw-sync");
const prependFile = require("prepend-file");
const utils = require("../utils/utils");
const properties = require("../properties");
const offlineService = require("../utils/offlineService");
const questionService = require("../utils/questionService");
const yaml = require("yaml");

// Convert folder file hbs to generator files db
const getGenFiles = function(pathTemplate) {
  const klawSync = require("klaw-sync");

  return klawSync(pathTemplate, {
    nodir: true
  })
    .map(file => {
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
        };
      }
    })
    .filter(file => file);
};

const getProperties = (content, nameFileTemplate, pathTemplate) => {
  // get properties
  let start = "**** PROPERTIES SKAFFOLDER ****\r\n";
  let startPropr = content.indexOf(start);
  if (startPropr == -1) {
    start = "**** PROPERTIES SKAFFOLDER ****\n";
    startPropr = content.indexOf(start);
  }

  let end = "\r\n**** END PROPERTIES SKAFFOLDER ****\r\n";
  let endPropr = content.indexOf(end);
  if (endPropr == -1) {
    end = "\n**** END PROPERTIES SKAFFOLDER ****\n";
    endPropr = content.indexOf(end);
  }

  if (startPropr == -1 || endPropr == -1) {
    console.warn("Properties Skaffoler not found in file " + nameFileTemplate);
    return {
      template: content
    };
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
};

exports.importGenerator = function() {
  let templateFolder = path.normalize("./.skaffolder/template");
  // clean generator
  fs.removeSync(templateFolder);

  klawSync(process.cwd(), {
    filter: function(item) {
      const basename = path.basename(item.path);
      let filter = basename[0] !== "." && basename !== "dist" && basename !== "bin" && basename !== "node_modules";
      return filter;
    }
  }).map(file => {
    if (file.stats.isFile()) {
      let isBinaryFile = require("isbinaryfile");

      if (isBinaryFile.sync(file.path)) {
        // is binary file
        let destPath = path.normalize(templateFolder + "/" + path.relative(process.cwd(), file.path));
        mkdirp.sync(path.normalize(destPath.substr(0, destPath.lastIndexOf(path.sep))));
        fs.copyFileSync(file.path, destPath);
      } else {
        // is text file
        let destPath = path.normalize(templateFolder + "/" + path.relative(process.cwd(), file.path) + ".hbs");
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
};

exports.loadGenerator = function(idProj, idGen, cb) {
  projectService.getGeneratorFile(idGen, (err, files) => {
    try {
      files = JSON.parse(files);
    } catch (e) {}
    files = writeGeneratorFiles("", files);
    if (cb) {
      cb(projectService.getGeneratorFile);
    } else {
      process.exit(0);
    }
  });
};

exports.loadTemplateFiles = function(idFrontend, idBackend, cb) {
  projectService.getTemplateFiles(idFrontend, idBackend, (err, files) => {
    writeGeneratorFiles("", files);
    if (cb) {
      cb();
    } else {
      process.exit(0);
    }
  });
};

let getFileContent = file => {
  let start = "**** PROPERTIES SKAFFOLDER ****\r\n";
  let end = "\r\n**** END PROPERTIES SKAFFOLDER ****\r\n";
  let template = file.template;
  file.template = undefined;
  file._id = undefined;
  file.__v = undefined;
  file._generator = undefined;
  file.name = undefined;
  file.ignore = undefined;
  if (file._partials) file._partials.filter(part => (part._id = undefined));

  let content = start + JSON.stringify(file, null, 4) + end + template;

  return content;
};

function writeGeneratorFiles(workspacePath, files) {
  files.filter(file => {
    let path = generatorBean.pathTemplate + file.name;
    path = path.replace(/{{#([^}]+)}}{{\/([^}]+)}}/g, "{{$1}}");
    mkdirp.sync(workspacePath + path.substr(0, path.lastIndexOf("/")));
    if (file.templateList) {
      fs.writeFileSync(workspacePath + path + "_SK_LIST.hbs", file.templateList);
      file.templateList = undefined;
    }
    if (file.templateEdit) {
      fs.writeFileSync(workspacePath + path + "_SK_EDIT.hbs", file.templateEdit);
      file.templateEdit = undefined;
    }
    if (file.templateBinary) {
      fs.writeFileSync(workspacePath + path, getFileContent(file));
    } else {
      fs.writeFileSync(workspacePath + path + ".hbs", getFileContent(file));
    }
  });
  return files;
}

function createProjectExtension(workspacePath, projectId, logger, frontendId, backendId, skObj, cb) {
  try {
    fs.removeSync(workspacePath + "./.skaffolder");
    mkdirp.sync(workspacePath + "./.skaffolder/template");
  } catch (e) {
    console.error(e);
  }
  fs.writeFileSync(
    workspacePath + "./.skaffolder/config.json",
    JSON.stringify(
      {
        project: projectId
      },
      null,
      4
    )
  );
  logger.info(chalk.green("✔   Project created!"));
  logger.info(
    chalk.blue("You can edit your project structure at ") +
      chalk.yellow(properties.endpoint + "/#!/projects/" + projectId + "/models") +
      chalk.blue(" or running ") +
      chalk.yellow("'sk web open'")
  );

  try {
    // CREATE TEMPLATE
    projectService.getTemplateFiles(frontendId.context, backendId.context, function(err, generatorFiles) {
      writeGeneratorFiles(workspacePath, generatorFiles);
      cb(skObj);
    });
  } catch (e) {
    console.error(e);
  }
}

const getEmptyProjectData = nameProject => {
  return {
    project: {
      name: nameProject
    },
    modules: [
      {
        name: "Home",
        url: "/home",
        _roles: []
      }
    ],
    resources: [
      {
        _id: offlineService.getDummyId(nameProject, "db"),
        name: nameProject + "_db",
        _resources: [
          {
            url: "/user",
            type: "User",
            name: "User",
            _relations: [],
            _entity: {
              type: "User",
              name: "User",
              _relations: [],
              _attrs: [
                {
                  name: "mail",
                  type: "String"
                },
                {
                  name: "name",
                  type: "String"
                },
                {
                  name: "password",
                  required: true,
                  type: "String"
                },
                {
                  name: "roles",
                  type: "String"
                },
                {
                  name: "surname",
                  type: "String"
                },
                {
                  name: "username",
                  required: true,
                  type: "String"
                }
              ]
            },
            _services: [
              {
                name: "changePassword",
                url: "/{id}/changePassword",
                method: "POST",
                description: "Change password of user from admin",
                returnType: "object",
                _roles: [
                  {
                    _id: "ADMIN"
                  }
                ]
              },
              {
                name: "create",
                url: "/",
                method: "POST",
                description: "CRUD ACTION create",
                returnType: "",
                crudAction: "create",
                _roles: []
              },
              {
                name: "delete",
                url: "/{id}",
                method: "DELETE",
                description: "CRUD ACTION delete",
                returnType: "",
                crudAction: "delete",
                _roles: [],
                _params: [
                  {
                    name: "id",
                    type: "ObjectId",
                    description: "Id"
                  }
                ]
              },
              {
                _id: "5e3f47537183501c622c34e4",
                _resource: "5e3f47537183501c622c34df",
                name: "get",
                url: "/{id}",
                method: "GET",
                description: "CRUD ACTION get",
                returnType: "",
                crudAction: "get",
                _roles: [],
                __v: 0,
                _params: [
                  {
                    _id: "5e3f47537183501c622c34ea",
                    _service: "5e3f47537183501c622c34e4",
                    name: "id",
                    type: "ObjectId",
                    description: "Id resource",
                    __v: 0
                  }
                ]
              },
              {
                name: "list",
                url: "/",
                method: "GET",
                description: "CRUD ACTION list",
                returnType: "",
                crudAction: "list",
                _roles: []
              },
              {
                name: "update",
                url: "/{id}",
                method: "POST",
                description: "CRUD ACTION update",
                returnType: "",
                crudAction: "update",
                _roles: [],
                _params: [
                  {
                    name: "id",
                    type: "ObjectId",
                    description: "Id"
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    roles: [
      {
        _id: "ADMIN",
        name: "ADMIN"
      }
    ]
  };
};

const importOpenAPI = async function(openapiFilePath, nameProject) {
  // Read YAML
  let openApiFileContent = fs.readFileSync(openapiFilePath, "utf-8");
  let openApi = yaml.parse(openApiFileContent);

  // Merge previous openapi
  let workspacePath = "";
  let oldYaml = offlineService.getYaml(workspacePath + "./openapi.yaml");
  openApi = offlineService.mergeYaml(oldYaml, openApi);

  // Normalize YAML
  openApi = await normalizeYaml(openApi, nameProject);

  // Write YAML
  logger.info(chalk.green("Writing file ") + chalk.yellow("openapi.yaml"));
  openApiFileContent = yaml.stringify(openApi);
  fs.writeFileSync("openapi.yaml", openApiFileContent, "utf-8");

  // Ask to generate code
};

const normalizeYaml = async function(openApi, nameProject) {
  // Set project name
  if (!openApi.info) {
    openApi.info = {};
  }

  if (nameProject) {
    openApi.info.title = utils.slug(nameProject);
  } else {
    openApi.info.title = utils.slug(openApi.info.title);
    nameProject = openApi.info.title;
  }

  // Create db if not exists
  if (!openApi.components) {
    openApi.components = {};
  }
  if (!openApi.components["x-skaffolder-db"]) {
    openApi.components["x-skaffolder-db"] = [];
  }
  if (openApi.components["x-skaffolder-db"].length == 0) {
    const db_name = nameProject + "_db";
    openApi.components["x-skaffolder-db"].push({
      "x-skaffolder-id": offlineService.getDummyId(db_name, "db"),
      "x-skaffolder-name": db_name
    });
  }
  let defaultDbId = openApi.components["x-skaffolder-db"][0]["x-skaffolder-id"];

  // Ask components to link to db
  if (!openApi.components.schemas) {
    openApi.components.schemas = {};
  } else {
    let questionList = [];
    for (let name in openApi.components.schemas) {
      let model = openApi.components.schemas[name];
      // Add as model db choose
      if (model.type == "object" && !model["x-skaffolder-id-db"] && model["x-skaffolder-ignore"] !== true) {
        questionList.push({
          title: name,
          value: name
        });
      }
    }

    // Ask unknown model
    if (questionList.length > 0) {
      const components = await questionService.askMultiple("Select the schemas that represent a database entity", questionList);
      if (!components.value) return;

      // Assign db to selected components
      components.value.filter(name => {
        openApi.components.schemas[name]["x-skaffolder-id-db"] = defaultDbId;
      });
    }
  }

  // Normalize models
  for (let name in openApi.components.schemas) {
    let model = openApi.components.schemas[name];

    if (!model["x-skaffolder-id-db"]) {
      // Set ignore Skaffolder
      model["x-skaffolder-ignore"] = true;
    } else {
      // Create id model
      if (!model["x-skaffolder-id"]) {
        model["x-skaffolder-id"] = offlineService.getDummyId(name, "resource");
      }

      // Normalize attributes
      if (!model.properties) model.properties = {};
      Object.keys(model.properties).forEach(attrName => {
        let attr = model.properties[attrName];
        attr["x-skaffolder-type"] = offlineService.getSkaffolderAttrType(attr.type);
      });
    }
  }

  // Add the user model if no one is called user
  if (!openApi.components.schemas.User) {
    logger.info(chalk.green("Adding model ") + chalk.yellow("User"));

    openApi.components.schemas.User = {
      "x-skaffolder-id": offlineService.getDummyId("User", "resource"),
      "x-skaffolder-id-db": defaultDbId,
      "x-skaffolder-url": "/user",
      "x-skaffolder-type": "User",
      properties: {
        _id: {
          type: "string",
          "x-skaffolder-required": true
        },
        mail: {
          type: "string",
          "x-skaffolder-id-attr": offlineService.getDummyId("User_mail", "attr"),
          "x-skaffolder-type": "String"
        },
        name: {
          type: "string",
          "x-skaffolder-id-attr": offlineService.getDummyId("User_name", "attr"),
          "x-skaffolder-type": "String"
        },
        password: {
          type: "string",
          "x-skaffolder-id-attr": offlineService.getDummyId("User_password", "attr"),
          "x-skaffolder-type": "String",
          "x-skaffolder-required": true
        },
        roles: {
          type: "string",
          "x-skaffolder-id-attr": offlineService.getDummyId("User_roles", "attr"),
          "x-skaffolder-type": "String"
        },
        surname: {
          type: "string",
          "x-skaffolder-id-attr": offlineService.getDummyId("User_surname", "attr"),
          "x-skaffolder-type": "String"
        },
        username: {
          type: "string",
          "x-skaffolder-id-attr": offlineService.getDummyId("User_username", "attr"),
          "x-skaffolder-type": "String",
          "x-skaffolder-required": true
        }
      },
      "x-skaffolder-relations": [],
      required: ["_id", "password", "username"]
    };
  }

  // Add page Home
  if (!openApi.components["x-skaffolder-page"]) {
    openApi.components["x-skaffolder-page"] = [];
  }

  if (openApi.components["x-skaffolder-page"].filter(page => page["x-skaffolder-name"] == "Home").length == 0) {
    logger.info(chalk.green("Adding page ") + chalk.yellow("Home"));

    openApi.components["x-skaffolder-page"].push({
      "x-skaffolder-id": offlineService.getDummyId("Home", "page"),
      "x-skaffolder-name": "Home",
      "x-skaffolder-url": "/home",
      "x-skaffolder-template": undefined,
      "x-skaffolder-resource": undefined,
      "x-skaffolder-services": [],
      "x-skaffolder-nesteds": [],
      "x-skaffolder-links": [],
      "x-skaffolder-roles": []
    });
  }

  // Assign Services To Resource by URL
  openApi = offlineService.assignServicesToResource(openApi);

  // Ask resource services not linked to any resource - try link by tag or url
  // for (let path_name in paths) {
  //   for (let service_name in paths[path_name]) {
  //   }
  // }

  // Ask to create crud

  return openApi;
};

exports.normalizeYaml = normalizeYaml;
exports.importOpenAPI = importOpenAPI;
exports.getEmptyProjectData = getEmptyProjectData;
exports.getGenFiles = getGenFiles;
exports.createProjectExtension = createProjectExtension;
exports.getProperties = getProperties;
