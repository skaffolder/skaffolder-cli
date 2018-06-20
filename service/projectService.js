var properties = require('../properties');
var request = require('../utils/request');
var configUtils = require('../utils/config');

exports.getProject = function (cb) {
    var config = configUtils.getConf();
    request({
        url: properties.endpoint + "/project/" + config.project,
        method: "GET",
    }, cb);
}

exports.getProjectData = function (cb) {
    var config = configUtils.getConf();
    request({
        url: properties.endpoint + "/project/" + config.project + "/getProject",
        method: "GET",
    }, cb);
}

exports.create = function (name, cb) {
    request({
        url: properties.endpoint + "/Project",
        method: "POST",
        json: {
            name: name,
            _dbs: []
        }
    }, cb);
}

exports.getModelsList = function (cb) {
    var config = configUtils.getConf();
    request({
        url: properties.endpoint + "/model/findBy_project/" + config.project + "/populate",
        method: "GET",
    }, cb);
}

exports.getGeneratorList = function (idProj, cb) {
    request({
        url: properties.endpoint + "/generator/findBy_project/" + idProj,
        method: "GET",
    }, cb);
}

exports.getProjectList = function (cb) {
    request({
        url: properties.endpoint + "/project",
        method: "GET",
    }, cb);
}

exports.getTemplate = function (cb) {
    request({
        url: properties.endpoint + "/template",
        method: "GET",
    }, cb);
}

exports.getEntityFindByDb = function (db, cb) {
    request({
        url: properties.endpoint + "/entity/findBy_db/" + db,
        method: "GET",
    }, cb);
}

exports.createFromTemplate = function (idProj, idFrontend, idBackend, cb) {
    request({
        url: properties.endpoint + "/generator/project/" + idProj + "/createFromTemplate",
        method: "POST",
        json: {
            backend: idBackend,
            frontend: idFrontend,
            projId: idProj
        }
    }, cb);
}

exports.createApi = function (service, cb) {
    request({
        url: properties.endpoint + "/service",
        method: "POST",
        json: service
    }, cb);
}

exports.getGeneratorFile = function (idGen, cb) {
    request({
        url: properties.endpoint + "/generatorFile/findBy_generator/" + idGen,
        method: "GET",
    }, cb);
}

exports.createCrud = function (idModel, cb) {
    request({
        url: properties.endpoint + "/model/" + idModel + "/createCrud",
        method: "GET",
    }, cb);
}

exports.createPage = function (name, cb) {
    var config = configUtils.getConf();
    request({
        url: properties.endpoint + "/page",
        method: "POST",
        json: {
            left: 6200,
            name: name,
            state: "pending",
            top: 5100,
            url: "/" + name,
            _links: [],
            _nesteds: [],
            _project: config.project,
            _roles: [],
            _services: []
        }
    }, cb);
}


exports.createModel = function (name, db, attributes, relations, cb) {
    var config = configUtils.getConf();
    let url = name;

    request({
        url: properties.endpoint + "/model",
        method: "POST",
        json: {
            name: name,
            left: 6200,
            top: 5100,
            _project: config.project,
            _resource: {
                _services: [],
                url: "/" + url
            },
            _entity: {
                _project: config.project,
                _relations: relations,
                _attrs: attributes,
                _db: db
            },
        }
    }, cb);
}