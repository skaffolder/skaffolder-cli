var properties = require('../properties');
var request = require('request');
var cache = require('persistent-cache');
var globals = cache();
var token = globals.getSync("token");

exports.create = function (name, cb) {

    request({
        url: properties.endpoint + "/Project",
        method: "POST",
        headers: {
            'Token': token
        },
        json: {
            name: name,
            _dbs: []
        }
    }, function (error, response, body) {
        if (body && body.message)
            error = body;
        cb(error, body);
    });

}