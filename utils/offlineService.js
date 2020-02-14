const chalk = require("chalk");
const fs = require("fs");
const yaml = require("yaml");
const utils = require("./utils");
const yamlOptions = require("yaml/types.js");
const arraySort = require("array-sort");
const generatorBean = require("../generator/GeneratorBean");
const generatorUtils = require("../generator/GeneratorUtils");
const lodash = require("lodash");

const _getOpenApiPath = path => {
  if (path) {
    if (!path.endsWith("/openapi.yaml")) {
      if (path.endsWith("/")) {
        return `${path}openapi.yaml`;
      }
      return `${path}/openapi.yaml`;
    }
  } else {
    return "./openapi.yaml";
  }

  return path;
};

const getYaml = function(path, logger) {
  if (typeof logger == "undefined") {
    logger = console;
  }

  try {
    let dataYaml = fs.readFileSync(_getOpenApiPath(path), "utf-8");

    try {
      fileObj = yaml.parse(dataYaml);

      return fileObj;
    } catch (e) {
      logger.error(chalk.red("openapi.yaml file not parsable"));
      logger.error(e);
      process.exit(0);
    }
  } catch (e) {
    logger.error(chalk.red("openapi.yaml file not found"));
    logger.debug(e);
    process.exit(0);
  }
};

const commitYaml = function(yamlProject, path, logger) {
  if (typeof logger == "undefined") {
    logger = console;
  }

  try {
    yamlOptions.nullOptions.nullStr = "";
    let dataYaml = yaml.stringify(yamlProject);

    try {
      fs.writeFileSync(_getOpenApiPath(path), dataYaml);
    } catch (e) {
      logger.error(chalk.red("openapi.yaml file not found"));
      logger.debug(e);
      process.exit(0);
    }
  } catch (e) {
    logger.error(chalk.red("Project not convertible to yaml"));
    logger.debug(e);
  }
};

const getDummyId = (name, type) => {
  return `_${name}_${type}_id`.toLowerCase().replace(/\s/g, "");
};

const cloneObject = obj => (obj ? JSON.parse(JSON.stringify(obj)) : obj);

const translateYamlProject = function(yamlProject) {
  if (typeof yamlProject == "undefined") {
    return {};
  }

  let skProject = {};
  let components = yamlProject.components;

  const getPagesArray = function() {
    if (components && components["x-skaffolder-page"]) {
      return components["x-skaffolder-page"]
        .map(item => {
          return item["x-skaffolder-id"] || getDummyId(item.name, "page");
        })
        .sort();
    }

    return [];
  };

  const getDBsArray = function() {
    if (components && components["x-skaffolder-db"]) {
      return components["x-skaffolder-db"]
        .map(item => {
          return {
            _id: item["x-skaffolder-id"] || getDummyId(item["x-skaffolder-name"], "db"),
            name: item["x-skaffolder-name"],
            _owner: "",
            _members: []
          };
        })
        .sort((a, b) => a._id > b._id);
    }

    return [];
  };

  // project property
  let project = {};
  project._id = yamlProject.info["x-skaffolder-id-project"];
  project._owner = ""; // not in yaml
  project.name = yamlProject.info.title;
  project._members = []; // not in yaml
  project._projects = []; // not in yaml
  project._pages = getPagesArray();
  project._dbs = getDBsArray();

  skProject.project = project;

  const getRolesArray = function(roles) {
    if (roles) {
      return roles.map(role_id => {
        return cloneObject(role_id2role[role_id]);
      });
    }

    return roles;
  };

  // roles propery
  if (components) {
    let roles = components["x-skaffolder-roles"];
    let role_id2role = {};

    if (roles) {
      skProject.roles = roles.map(role => {
        let role = {
          _id: role["x-skaffolder-id"] || getDummyId(role["x-skaffolder-name"], "role"),
          description: role["x-skaffolder-name"],
          name: role["x-skaffolder-name"],
          _project: skProject.project._id
        };

        role_id2role[role._id] = role;
        return role;
      });
    }
  }

  //dbs property
  let dbs = getDBsArray();
  dbs.forEach(db => {
    // _entity property
    let schemas = components.schemas;
    let _entity = [];

    for (let model_name in schemas) {
      let model = schemas[model_name];
      let _model = {};
      let model_db_id = model["x-skaffolder-id-db"];

      if (!model_db_id) {
        model_db_id = db._id;
      } else if (model_db_id != db._id) {
        continue;
      }

      _model._id = model["x-skaffolder-id-entity"] || getDummyId(model_name, "entity");
      _model.type = model["x-skaffolder-type"];
      _model._db = model_db_id;
      _model.name = model_name;
      _model._attrs = [];
      _model._relations = [];

      // entity._attrs property
      for (let attr_name in model.properties) {
        if (attr_name == "_id") {
          continue;
        }
        let attr = model.properties[attr_name];

        let _attr = {
          _id: attr["x-skaffolder-id-attr"] || getDummyId(`${model_name}_${attr_name}`, "attr"),
          _entity: _model._id,
          name: attr_name,
          type: attr["x-skaffolder-type"],
          required: attr["x-skaffolder-required"],
          unique: attr["x-skaffolder-unique"]
        };

        if (attr["x-skaffolder-enumeration"]) {
          _attr._enum = attr["x-skaffolder-enumeration"].map(item => {
            return {
              name: item,
              _attr: _attr._id
            };
          });
        }

        _model._attrs.push(_attr);
      }

      _entity.push(_model);
    }

    //entity._relations property
    for (let model_name in schemas) {
      let model = schemas[model_name];
      let model_db_id = model["x-skaffolder-id-db"];

      if (!model_db_id) {
        model_db_id = db._id;
      } else if (model_db_id != db._id) {
        continue;
      }

      for (let rel_name in model["x-skaffolder-relations"]) {
        let rel = model["x-skaffolder-relations"][rel_name];

        const findRelEntity = function(id) {
          return _entity.reduce((acc, item) => {
            if (item._id == id) {
              return {
                _id: item._id,
                name: item.name,
                _db: item._db
              };
            }

            return acc;
          }, {});
        };

        let _rel = {
          _id: rel["x-skaffolder-id"] || getDummyId(`${model_name}_${rel_name}`, "relation"),
          type: rel["x-skaffolder-type"],
          required: rel["x-skaffolder-required"],
          name: rel_name,
          _ent2: findRelEntity(rel["x-skaffolder-ent2"]),
          _ent1: findRelEntity(rel["x-skaffolder-ent1"])
        };
        let _model1 = _entity.find(item => {
          return item._id == (model["x-skaffolder-id-entity"] || getDummyId(item.name, "entity"));
        });
        _model1._relations.push(_rel);

        let _model2 = _entity.find(item => {
          return item._id == rel["x-skaffolder-ent2"];
        });
        if (!_model2) {
          _model2 = _entity.find(item => {
            return item._id == getDummyId(rel["x-skaffolder-ent2"], "entity");
          });
        }

        // if it is not a self relation
        if (_rel._ent2._id != _rel._ent1._id) _model2._relations.push(Object.assign({}, _rel));
      }
    }

    _entity.sort((a, b) => {
      return a.name > b.name;
    });
    db._entity = _entity;
  });

  skProject.dbs = dbs;

  // resources property
  let resources = getDBsArray();
  let res_id2resource = {};
  let serv_id2service = {};

  resources.forEach(db => {
    let _resources = [];
    let schemas = components.schemas;
    let paths = yamlProject.paths;
    let resource_name2id = {};

    // resources services
    let res_id2services = {};

    const findResEntity = function(id_db, id_entity) {
      let db = skProject.dbs.find(db_item => {
        return id_db == db_item._id;
      });

      if (db && db._entity) {
        return db._entity.find(ent_item => {
          return ent_item._id == id_entity;
        });
      }

      return null;
    };

    // create resources
    for (model_name in schemas) {
      let model = schemas[model_name];
      let model_db_id = model["x-skaffolder-id-db"];
      let _resource = {};

      if (!model_db_id || model_db_id != db._id) {
        continue;
      }

      // _resource
      _resource._id = model["x-skaffolder-id"] || getDummyId(model_name, "resource");
      _resource.url = model["x-skaffolder-url"];
      _resource.type = model["x-skaffolder-type"];
      _resource.name = model_name;
      _resource._project = project._id;
      _resource._db = db._id;
      _resource._entity = cloneObject(findResEntity(db._id, model["x-skaffolder-id-entity"] || getDummyId(model_name, "entity"))); // deep clone
      _resource._roles = [];

      resource_name2id[_resource.name.toLowerCase()] = _resource._id;
      res_id2resource[_resource._id] = cloneObject(_resource);

      _resources.push(_resource);

      if (!res_id2services[_resource._id]) {
        res_id2services[_resource._id] = [];
      }
    }

    // Parse services
    for (let path_name in paths) {
      for (let service_name in paths[path_name]) {
        let service = paths[path_name][service_name];

        if (service["x-skaffolder-ignore"]) continue;

        let resource_id = service["x-skaffolder-id-resource"];
        if (service["x-skaffolder-resource"] && resource_name2id[service["x-skaffolder-resource"].toLowerCase()]) {
          resource_id = resource_name2id[service["x-skaffolder-resource"].toLowerCase()];
        }

        if (!res_id2services[resource_id]) {
          continue;
        }

        let _service = {
          _id:
            service["x-skaffolder-id"] ||
            getDummyId(`${service["x-skaffolder-name"] || service_name}_${service["x-skaffolder-resource"]}`, "service"),
          _resource: resource_id,
          name: service["x-skaffolder-name"],
          url: service["x-skaffolder-url"],
          method: service_name.toUpperCase(),
          description: service["x-skaffolder-description"] || service["summary"],
          returnType: service["x-skaffolder-returnType"] || undefined,
          crudType: service["x-skaffolder-crudType"] || undefined,
          crudAction: service["x-skaffolder-crudAction"],
          _roles: getRolesArray(service["x-skaffolder-roles"]),
          returnDesc: service["x-skaffolder-returnDesc"] || undefined,
          _params: []
        };

        for (serviceParam_index in service.parameters) {
          let serviceParam = service.parameters[serviceParam_index];

          _service._params.push({
            _id: undefined, // not in yaml
            _service: _service._id,
            name: serviceParam.name,
            type: serviceParam["x-skaffolder-type"] || serviceParam.schema.type,
            description: serviceParam.description
          });
        }

        res_id2services[resource_id].push(_service);
        serv_id2service[_service._id] = cloneObject(_service);
      }
    }

    const findResRelation = function(id_entity) {
      let res = _resources.find(res => {
        if (res._entity) {
          return res._entity._id == id_entity;
        }

        return false;
      });

      if (res) {
        return {
          _id: res._id,
          url: res.url,
          name: res.name,
          _project: res._project,
          _db: res._db,
          _entity: id_entity,
          _roles: res._roles
        };
      }
    };

    // resources relations and services
    _resources.forEach(res => {
      if (res._entity) {
        let _relations = res._entity._relations;

        _relations.forEach(rel => {
          rel._ent1._resource = findResRelation(rel._ent1._id);
          rel._ent2._resource = findResRelation(rel._ent2._id);
        });

        res._relations = [...res._entity._relations];
      } else {
        res._relations = [];
      }

      let _services = res_id2services[res._id];
      arraySort(_services, "name");
      res._services = _services;
    });

    _resources.sort((a, b) => {
      return a.name > b.name;
    });
    db._resources = _resources;
  });

  skProject.resources = resources;

  // modules propery
  let pages = components["x-skaffolder-page"];
  let modules = [];
  let page_id2page = {};

  if (pages) {
    pages.forEach(page => {
      let _module = {};

      _module._id = page["x-skaffolder-id"] || getDummyId(page["x-skaffolder-name"], "page");
      _module.top = 5100;
      _module.left = 6400;
      _module.url = page["x-skaffolder-url"];
      _module._template_resource = page["x-skaffolder-resource"];
      _module.template = page["x-skaffolder-template"];
      _module.name = page["x-skaffolder-name"];
      _module._services = [];
      _module._roles = getRolesArray(page["x-skaffolder-roles"]);
      _module._nesteds = page["x-skaffolder-nesteds"] || [];
      _module._links = page["x-skaffolder-links"] || [];
      _module._resources = [];

      let page_services = page["x-skaffolder-services"];

      if (page_services) {
        page_services.forEach(serv_id => {
          let _service = cloneObject(serv_id2service[serv_id]);

          if (_service) {
            let resource = res_id2resource[_service._resource];

            if (resource) {
              _service._resource = {
                _id: resource._id,
                url: resource.url,
                name: resource.name,
                _project: resource._project,
                _db: resource._db,
                _entity: resource._entity._id,
                __v: resource.__v,
                _roles: resource._roles
              };
            }

            if (
              !_module._resources.some(item => {
                return item._id == _service._resource._id;
              })
            ) {
              _module._resources.push(Object.assign({}, _service._resource));
            }

            _module._services.push(_service);
          } else {
            console.error("Service " + serv_id + " not found");
          }
        });
      }

      modules.push(_module);
      page_id2page[_module._id] = cloneObject(_module);
    });
  }

  // add nesteds and links
  modules.forEach(page => {
    ["_nesteds", "_links"].forEach(page_type => {
      page[page_type] = page[page_type].map(page_id => {
        let subpage = cloneObject(page_id2page[page_id]);
        delete subpage._resources;

        if (subpage) {
          if (subpage._services) {
            subpage._services = subpage._services.map(item => {
              return item._id;
            });
          }

          if (subpage._roles) {
            subpage._roles = subpage._roles.map(item => {
              return item._id;
            });
          }
        }

        return subpage;
      });
    });
  });
  modules.sort((a, b) => {
    if (a.name > b.name) return 1;
    if (a.name < b.name) return -1;
    return 0;
  });
  skProject.modules = modules;

  return {
    project: skProject.project,
    modules: skProject.modules,
    resources: skProject.resources,
    dbs: skProject.dbs,
    roles: skProject.roles
  };
};

const generateYaml = function(projectData, logger) {
  if (projectData) {
    let project = projectData.project;
    let modules = projectData.modules;
    let resources = projectData.resources;
    let dbs = projectData.dbs;
    let roles = projectData.roles;
    let generatorFiles = generatorBean.getGenFiles(generatorBean.pathTemplate);

    try {
      generatorUtils.init("./", project, modules, resources, dbs, roles);

      if (generatorFiles) {
        let file = generatorFiles.find(val => {
          return val.name && val.name == "openapi.yaml";
        });

        if (file) {
          generatorBean.generateFile(file, [], utils, project, modules, resources, dbs);
        }
      }
    } catch (e) {
      logger.error("Error while generating openapi.yaml");
      logger.debug(e);
      process.exit(0);
    }
  }
};

const getProjectData = function(logger, path) {
  let yamlProject = getYaml(path, logger);

  return translateYamlProject(yamlProject);
};

const getProject = function(logger) {
  let yamlProject = getYaml(null, logger);

  if (typeof yamlProject == "undefined") {
    process.exit(0);
  }

  let components = yamlProject.components;

  const getArrayOfType = function(type) {
    if (components && components[`x-skaffolder-${type}`]) {
      return components[`x-skaffolder-${type}`]
        .map(item => {
          return item["x-skaffolder-id"] || getDummyId(item.name, type);
        })
        .sort();
    }

    return [];
  };

  // project property
  let project = {};
  project._id = yamlProject.info["x-skaffolder-id-project"];
  project._owner = ""; // not in yaml
  project.name = yamlProject.info.title;
  project._members = []; // not in yaml
  project._projects = []; // not in yaml
  project._pages = getArrayOfType("page");
  project._dbs = getArrayOfType("db");

  return project;
};

const getEntityFindByDb = function(db_id, logger) {
  let yamlProject = getYaml(null, logger);

  if (typeof yamlProject == "undefined") {
    process.exit(0);
  }

  let components = yamlProject.components;
  let db;

  if (components && components["x-skaffolder-db"]) {
    db = components["x-skaffolder-db"].find(item => {
      return db_id == item["x-skaffolder-id"] || db_id == getDummyId(item["x-skaffolder-name"], "db");
    });
  }

  if (db) {
    let schemas = components.schemas;
    let _entity = [];

    for (let model_name in schemas) {
      let model = schemas[model_name];
      let _model = {};
      let model_db_id = model["x-skaffolder-id-db"];

      if (!model_db_id || model_db_id != db_id) {
        continue;
      }

      _model._id = model["x-skaffolder-id-entity"] || getDummyId(model_name, "entity");
      _model._db = model_db_id;
      _model.name = model_name;
      _model._attrs = [];
      _model._relations = [];

      // entity._attrs property
      for (let attr_name in model.properties) {
        if (attr_name == "_id") {
          continue;
        }
        let attr = model.properties[attr_name];

        let _attr = {
          _id: attr["x-skaffolder-id-attr"] || getDummyId(`${model_name}_${attr_name}`, "attr"),
          _entity: _model._id,
          name: attr_name,
          type: attr["x-skaffolder-type"],
          required: attr["x-skaffolder-required"],
          unique: attr["x-skaffolder-unique"]
        };

        if (attr["x-skaffolder-enumeration"]) {
          _attr._enum = attr["x-skaffolder-enumeration"].map(item => {
            return {
              name: item,
              _attr: _attr._id
            };
          });
        }

        _model._attrs.push(_attr);
      }
      _entity.push(_model);
    }

    _entity.sort((a, b) => {
      return a.name > b.name;
    });
    return _entity;
  }

  return [];
};

const getModelsList = function(logger) {
  let skProject = getProjectData(logger);

  if (typeof skProject == "undefined") {
    return [];
  }

  let modelsList = [];

  if (skProject.resources) {
    skProject.resources.forEach(db => {
      if (db._resources) {
        modelsList = [
          ...modelsList,
          ...db._resources.map(_res => {
            return {
              _id: getDummyId(_res.name, "model"),
              name: `${_res.name}`,
              _resource: cloneObject(_res)
            };
          })
        ];
      }
    });
  }

  return modelsList;
};

const assignServicesToResource = function(openApi) {
  // Create model map
  let modelsURIMap = {};
  for (let model_name in openApi.components.schemas) {
    if (openApi.components.schemas[model_name]["x-skaffolder-id-db"]) {
      let url = openApi.components.schemas[model_name]["x-skaffolder-url"] || model_name;
      url = url.replace("/", "").toLowerCase();
      modelsURIMap[url] = openApi.components.schemas[model_name];
    }
  }

  let idNoneModel = null;

  // Match services url and model name
  for (let url in openApi.paths) {
    for (let method in openApi.paths[url]) {
      let service = openApi.paths[url][method];
      if (url[0] != "/") url = "/" + url;
      let baseUrl = url.split("/")[1].toLowerCase();

      // Match with singular or plural url
      let model = modelsURIMap[baseUrl];
      let model_name = baseUrl;
      if (!model) {
        baseUrl = baseUrl.replace(/.$/, "");
        model = modelsURIMap[baseUrl];
        model_name = baseUrl;
      }

      // Assign resource if found
      if (!model) {
        if (!idNoneModel) {
          // Create none db and model if not present
          model = createNoneDb(openApi);
        }
        model_name = "NONE";
      } else {
        // Assign model url
        if (!model["x-skaffolder-url"]) {
          model["x-skaffolder-url"] = "/" + url.split("/")[1];
        }
      }

      // Assign resource
      service["x-skaffolder-resource"] = model_name;
      service["x-skaffolder-id-resource"] = model["x-skaffolder-id"];
      logger.info(
        chalk.green("Assign service ") +
          chalk.blue(method.toUpperCase()) +
          " " +
          url +
          chalk.green(" to ") +
          chalk.yellow(model_name)
      );

      // Assign name is not present
      if (!service["x-skaffolder-name"]) {
        let spliced = url.split("/");
        spliced.splice(0, 2);
        let desc = utils.slug(spliced.join("_"));
        service["x-skaffolder-name"] = method + (model ? "_" + model_name : "") + (desc ? "_" + desc : "");
      }

      // Assign url is not present
      if (!service["x-skaffolder-url"]) {
        service["x-skaffolder-url"] = url.replace(model ? model["x-skaffolder-url"] : "", "") || "/";
      }
    }
  }

  return openApi;
};

const createNoneDb = function(openApi) {
  let idNoneDb;
  let idNoneRes;
  let noneRes;

  // search db
  if (!openApi.components["x-skaffolder-db"]) {
    openApi.components["x-skaffolder-db"] = [];
  }
  openApi.components["x-skaffolder-db"].forEach(db => {
    if (db["x-skaffolder-name"] == "NONE_db") {
      idNoneDb = db["x-skaffolder-id"];
    }
  });

  // create db
  if (!idNoneDb) {
    idNoneDb = "NONE_db";
    openApi.components["x-skaffolder-db"].push({
      "x-skaffolder-id": "NONE_db",
      "x-skaffolder-name": "NONE_db"
    });
  }

  // Search resource
  if (!openApi.components.schemas) {
    openApi.components.schemas = {};
  }

  Object.keys(openApi.components.schemas).forEach(model_name => {
    let model = openApi.components.schemas[model_name];
    if (model["x-skaffolder-id-db"] == idNoneDb && model_name == "NONE") {
      noneRes = model;
    }
  });

  // create resource
  if (!idNoneRes) {
    noneRes = {
      "x-skaffolder-id": getDummyId("NONE", "resource"),
      "x-skaffolder-id-db": idNoneDb,
      "x-skaffolder-name": "NONE",
      "x-skaffolder-url": "/",
      properties: {},
      "x-skaffolder-relations": []
    };
    openApi.components.schemas["NONE"] = noneRes;
  }

  return noneRes;
};

const getSkaffolderAttrType = function(swaggerType) {
  let type = "String";
  if (swaggerType == "string") type = "String";
  else if (swaggerType == "number") type = "Number";
  else if (swaggerType == "integer") type = "Integer";
  else if (swaggerType == "boolean") type = "Boolean";
  else if (swaggerType == "array") type = "Custom";
  else if (swaggerType == "object") type = "Custom";

  return type;
};

const mergeYaml = function(oldYaml, newYaml) {
  let mergedYaml = lodash.merge(oldYaml, newYaml);
  return mergedYaml;
};

exports.mergeYaml = mergeYaml;
exports.getSkaffolderAttrType = getSkaffolderAttrType;
exports.assignServicesToResource = assignServicesToResource;
exports.cloneObject = cloneObject;
exports.commitYaml = commitYaml;
exports.generateYaml = generateYaml;
exports.getDummyId = getDummyId;
exports.getYaml = getYaml;
exports.translateYamlProject = translateYamlProject;

exports.getEntityFindByDb = getEntityFindByDb;
exports.getModelsList = getModelsList;
exports.getProject = getProject;
exports.getProjectData = getProjectData;
