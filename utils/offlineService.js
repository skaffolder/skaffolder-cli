var chalk = require("chalk");
var fs = require("fs");
var yaml = require("yaml");
var yamlOptions = require("yaml/types.js");
var arraySort = require("array-sort");

var _getOpenApiPath = path => {
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

var getYaml = function(path, logger) {
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
      logger.debug(e);
      process.exit(0);
    }
  } catch (e) {
    logger.error(chalk.red("openapi.yaml file not found"));
    logger.debug(e);
    process.exit(0);
  }
};

var commitYaml = function(yamlProject, path, logger) {
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

var getDummyId = (name, type) => {
  return `_${name}_${type}_id`.toLowerCase().replace(/\s/g, "");
};

var cloneObject = obj => (obj ? JSON.parse(JSON.stringify(obj)) : obj);

var translateYamlProject = function(yamlProject) {
  if (typeof yamlProject == "undefined") {
    return {};
  }

  let skProject = {};
  let components = yamlProject.components;

  var getPagesArray = function() {
    if (components && components["x-skaffolder-page"]) {
      return components["x-skaffolder-page"]
        .map(item => {
          return item["x-skaffolder-id"] || getDummyId(item.name, "page");
        })
        .sort();
    }

    return [];
  };

  var getDBsArray = function() {
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

  var getRolesArray = function(roles) {
    if (roles) {
      return roles.map(role_id => {
        return cloneObject(role_id2role[role_id]);
      });
    }

    return roles;
  };

  // roles propery
  let roles = components["x-skaffolder-roles"];
  var role_id2role = {};

  if (roles) {
    skProject.roles = roles.map(role => {
      var role = {
        _id: role["x-skaffolder-id"] || getDummyId(role["x-skaffolder-name"], "role"),
        description: role["x-skaffolder-name"],
        name: role["x-skaffolder-name"],
        _project: skProject.project._id
      };

      role_id2role[role._id] = role;
      return role;
    });
  }

  //dbs property
  let dbs = getDBsArray();
  dbs.forEach(db => {
    // _entity property
    var schemas = components.schemas;
    var _entity = [];

    for (let model_name in schemas) {
      var model = schemas[model_name];
      var _model = {};
      var model_db_id = model["x-skaffolder-id-db"];

      if (!model_db_id) {
        model_db_id = db._id;
      } else if (model_db_id != db._id) {
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
        var attr = model.properties[attr_name];

        var _attr = {
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
      var model = schemas[model_name];
      var model_db_id = model["x-skaffolder-id-db"];

      if (!model_db_id) {
        model_db_id = db._id;
      } else if (model_db_id != db._id) {
        continue;
      }

      for (let rel_name in model["x-skaffolder-relations"]) {
        var rel = model["x-skaffolder-relations"][rel_name];

        var findRelEntity = function(id) {
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

        var _rel = {
          _id: rel["x-skaffolder-id"] || getDummyId(`${model_name}_${rel_name}`, "relation"),
          type: rel["x-skaffolder-type"],
          required: rel["x-skaffolder-required"],
          name: rel_name,
          _ent2: findRelEntity(rel["x-skaffolder-ent2"]),
          _ent1: findRelEntity(rel["x-skaffolder-ent1"])
        };
        var _model1 = _entity.find(item => {
          return item._id == (model["x-skaffolder-id-entity"] || getDummyId(item.name, "entity"));
        });
        _model1._relations.push(_rel);

        var _model2 = _entity.find(item => {
          return item._id == rel["x-skaffolder-ent2"];
        });
        if (!_model2) {
          _model2 = _entity.find(item => {
            return item._id == getDummyId(rel["x-skaffolder-ent2"], "entity");
          });
        }

        _model2._relations.push(Object.assign({}, _rel));
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
  var res_id2resource = {};
  var serv_id2service = {};

  resources.forEach(db => {
    var _resources = [];
    var schemas = components.schemas;
    var paths = yamlProject.paths;
    var resource_name2id = {};

    // resources services
    var res_id2services = {};

    var findResEntity = function(id_db, id_entity) {
      var db = skProject.dbs.find(db_item => {
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
      var model = schemas[model_name];
      var model_db_id = model["x-skaffolder-id-db"];
      var _resource = {};

      if (!model_db_id) {
        model_db_id = db._id;
      } else if (model_db_id != db._id) {
        continue;
      }

      // _resource
      _resource._id = model["x-skaffolder-id"] || getDummyId(model_name, "resource");
      _resource.url = model["x-skaffolder-url"];
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

    for (let path_name in paths) {
      for (let service_name in paths[path_name]) {
        var service = paths[path_name][service_name];

        if (service["x-skaffolder-ignore"]) continue;

        var resource_id = service["x-skaffolder-id-resource"];
        if (service["x-skaffolder-resource"] && resource_name2id[service["x-skaffolder-resource"].toLowerCase()]) {
          resource_id = resource_name2id[service["x-skaffolder-resource"].toLowerCase()];
        }

        var _service = {
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
          var serviceParam = service.parameters[serviceParam_index];

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

    var findResRelation = function(id_entity) {
      var res = _resources.find(res => {
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
        var _relations = res._entity._relations;

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
  var page_id2page = {};

  if (pages) {
    pages.forEach(page => {
      var _module = {};

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
          var _service = cloneObject(serv_id2service[serv_id]);
          var resource = res_id2resource[_service._resource];

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
        var subpage = cloneObject(page_id2page[page_id]);
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

var generateYaml = function(projectData, logger) {
  var generatorBean = require("../generator/GeneratorBean");
  var utils = require("../generator/GeneratorUtils");

  if (projectData) {
    var project = projectData.project;
    var modules = projectData.modules;
    var resources = projectData.resources;
    var dbs = projectData.dbs;
    var roles = projectData.roles;
    var generatorFiles = generatorBean.getGenFiles(generatorBean.pathTemplate);

    try {
      utils.init("./", project, modules, resources, dbs, roles);

      if (generatorFiles) {
        var file = generatorFiles.find(val => {
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

var getProjectData = function(logger, path) {
  let yamlProject = getYaml(path, logger);

  return translateYamlProject(yamlProject);
};

var getProject = function(logger) {
  let yamlProject = getYaml(null, logger);

  if (typeof yamlProject == "undefined") {
    process.exit(0);
  }

  let components = yamlProject.components;

  var getArrayOfType = function(type) {
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

var getEntityFindByDb = function(db_id, logger) {
  let yamlProject = getYaml(null, logger);

  if (typeof yamlProject == "undefined") {
    process.exit(0);
  }

  let components = yamlProject.components;
  var db;

  if (components && components["x-skaffolder-db"]) {
    db = components["x-skaffolder-db"].find(item => {
      return db_id == item["x-skaffolder-id"] || db_id == getDummyId(item["x-skaffolder-name"], "db");
    });
  }

  if (db) {
    var schemas = components.schemas;
    var _entity = [];

    for (let model_name in schemas) {
      var model = schemas[model_name];
      var _model = {};
      var model_db_id = model["x-skaffolder-id-db"];

      if (!model_db_id) {
        model_db_id = db_id;
      } else if (model_db_id != db_id) {
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
        var attr = model.properties[attr_name];

        var _attr = {
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

var getModelsList = function(logger) {
  let skProject = getProjectData(logger);

  if (typeof skProject == "undefined") {
    return [];
  }

  var modelsList = [];

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
