var properties = require('../properties');
var request = require('../utils/request');

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
    return cb(null, {});
    request({
        url: properties.endpoint + "/generatorFile/findBy_generator/" + idGen,
        method: "GET",
    }, cb);
}