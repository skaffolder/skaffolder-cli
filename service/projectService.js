const properties = require("../properties");
const request = require("../utils/request");
const configUtils = require("../utils/config");
const offline = require("../lib/offline");
const offlineService = require("../utils/offlineService");

exports.exportProject = function(params, cb) {
  request(
    {
      url: properties.endpoint + "/project/import/fromCLI",
      method: "POST",
      json: params
    },
    cb
  );
};

exports.getProject = function(cb) {
  if (!global.OFFLINE) {
    let config = configUtils.getConf();
    request(
      {
        url: properties.endpoint + "/project/" + config.project,
        method: "GET"
      },
      cb
    );
  } else {
    let project = offlineService.getProject(global.logger);
    cb(null, project);
  }
};

exports.getProjectData = function(cb) {
  if (!global.OFFLINE) {
    let config = configUtils.getConf();
    request(
      {
        url: properties.endpoint + "/project/" + config.project + "/getProject",
        method: "GET"
      },
      cb
    );
  } else {
    let projectData = offlineService.getProjectData(global.logger);
    cb(null, projectData);
  }
};

exports.create = function(name, cb) {
  request(
    {
      url: properties.endpoint + "/Project",
      method: "POST",
      json: {
        name: name,
        _dbs: []
      }
    },
    cb
  );
};

exports.importDb = function(fileContent, cb) {
  let config = configUtils.getConf();
  request(
    {
      url: properties.endpoint + "/Project/" + config.project + "/importDb",
      method: "POST",
      json: {
        fileContent: fileContent
      }
    },
    cb
  );
};

exports.getModelsList = function(cb) {
  if (!global.OFFLINE) {
    let config = configUtils.getConf();
    request(
      {
        url: properties.endpoint + "/model/findBy_project/" + config.project + "/populate",
        method: "GET"
      },
      cb
    );
  } else {
    let modelsList = offlineService.getModelsList(global.logger);
    cb(null, modelsList);
  }
};

exports.getGeneratorList = function(idProj, cb) {
  request(
    {
      url: properties.endpoint + "/generator/findBy_project/" + idProj,
      method: "GET"
    },
    cb
  );
};

exports.getProjectList = function(cb) {
  request(
    {
      url: properties.endpoint + "/project",
      method: "GET"
    },
    cb
  );
};

exports.getTemplate = function(cb) {
  request(
    {
      url: properties.endpoint + "/template",
      method: "GET"
    },
    cb
  );
};

exports.getEntityFindByDb = function(db, cb) {
  if (!global.OFFLINE) {
    request(
      {
        url: properties.endpoint + "/entity/findBy_db/" + db,
        method: "GET"
      },
      cb
    );
  } else {
    let entities = offlineService.getEntityFindByDb(db, global.logger);
    cb(null, entities);
  }
};

exports.createFromTemplate = function(idProj, idFrontend, idBackend, cb) {
  request(
    {
      url: properties.endpoint + "/generator/project/" + idProj + "/createFromTemplate",
      method: "POST",
      json: {
        backend: idBackend,
        frontend: idFrontend,
        projId: idProj
      }
    },
    cb
  );
};

exports.getTemplateFiles = function(frontendId, backendId, cb) {
  request(
    {
      url: properties.endpoint + "/Generator/getTemplateFiles/" + frontendId + "/" + backendId,
      method: "GET"
    },
    cb
  );
};

exports.shareGenerator = function(genFiles, helpers, cb) {
  request(
    {
      url: properties.endpoint + "/generator/share",
      method: "POST",
      json: {
        genFiles: genFiles,
        helpers: helpers
      }
    },
    cb
  );
};

exports.saveGenerator = function(idGen, genFiles, helpers, cb) {
  request(
    {
      url: properties.endpoint + "/generator/" + idGen + "/save",
      method: "POST",
      json: {
        genFiles: genFiles,
        helpers: helpers
      }
    },
    cb
  );
};

exports.createApi = function(service, cb) {
  if (!global.OFFLINE) {
    request(
      {
        url: properties.endpoint + "/service",
        method: "POST",
        json: service
      },
      cb
    );
  } else {
    cb(null, offline.createApi(service));
  }
};

exports.getGeneratorFile = function(idGen, cb) {
  request(
    {
      url: properties.endpoint + "/generatorFile/findBy_generator/" + idGen,
      method: "GET"
    },
    cb
  );
};

exports.createCrud = function(model, cb) {
  if (!global.OFFLINE) {
    request(
      {
        url: properties.endpoint + "/model/" + model._id + "/createCrud",
        method: "GET"
      },
      cb
    );
  } else {
    cb(null, offline.createCrud(model));
  }
};

exports.createPage = function(name, url, cb) {
  if (!global.OFFLINE) {
    let config = configUtils.getConf();
    request(
      {
        url: properties.endpoint + "/page",
        method: "POST",
        json: {
          left: 6200,
          name: name,
          state: "pending",
          top: 5100,
          url: url,
          _links: [],
          _nesteds: [],
          _project: config.project,
          _roles: [],
          _services: []
        }
      },
      cb
    );
  } else {
    cb(null, offline.createPage({ "x-skaffolder-name": name, "x-skaffolder-url": url }));
  }
};

exports.createModel = function(name, db, attributes, relations, url, cb) {
  if (!global.OFFLINE) {
    let config = configUtils.getConf();

    request(
      {
        url: properties.endpoint + "/model",
        method: "POST",
        json: {
          name: name,
          left: 6200,
          top: 5100,
          _project: config.project,
          _resource: {
            _services: [],
            url: url
          },
          _entity: {
            _project: config.project,
            _relations: relations,
            _attrs: attributes,
            _db: db
          }
        }
      },
      cb
    );
  } else {
    cb(null, offline.createModelSkaffolder(name, db, attributes, relations, url));
  }
};
