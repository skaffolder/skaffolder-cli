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
    }, function (error, body) {
        cb(error, body);
    });

}