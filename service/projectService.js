var properties = require('../properties');
var request = require('../utils/request');
var configUtils = require('../utils/config');

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

exports.getGeneratorFile = function (idGen, cb) {
    request({
        url: properties.endpoint + "/generatorFile/findBy_generator/" + idGen,
        method: "GET",
    }, cb);
}

exports.getProject = function (idProject, cb) {
    request({
        url: properties.endpoint + "/project/" + idProject + "/getProject",
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